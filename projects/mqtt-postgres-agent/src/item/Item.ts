// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { get } from "@woifes/gjson";
import { Client, Message, Subscription } from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttConnection,
    MqttUnsubHook,
} from "@woifes/mqtt-client/decorator";
import { Debugger } from "debug";
import { Pool } from "pg";
import { ItemConfig, rtItemConfig } from "./ItemConfig";
import { createQuery } from "./createQuery";
import { generateTopicVariants } from "./generateTopicVariants";

function getValueFromPayload(searchPath: string, payload: string): string {
    if (searchPath === "@this") {
        return payload; //TODO remove when "@woifes/gjson" supports the @this
    }
    return String(get(payload, searchPath));
}

@MqttClient()
export class Item {
    private config: ItemConfig;
    private serialValues: Map<string, string[]> = new Map();
    private singleValues: Map<string, string> = new Map();
    private serialConstants: Map<string, string[]> = new Map();
    private singleConstants: Map<string, string> = new Map();
    private serialValuesCount = 0;
    private valueTimes: Map<string, number> = new Map();
    private mqtt: Client;
    private subscriptions: Subscription[] = [];
    private pool: Pool;
    private debug: Debugger;

    constructor(
        config: ItemConfig,
        @MqttConnection() mqtt: Client,
        dbPool: Pool,
        parentDebugger: Debugger,
    ) {
        this.config = rtItemConfig.check(config);
        this.mqtt = mqtt;
        this.pool = dbPool;
        this.debug = parentDebugger.extend(this.config.table);
        if (this.config.payloadValues !== undefined) {
            for (const [valueName, searchPath] of Object.entries(
                this.config.payloadValues,
            )) {
                if (Array.isArray(searchPath)) {
                    this.serialValues.set(valueName, searchPath);
                    this.serialValuesCount = searchPath.length; //stupid reassignment because the equality of all arrays is assured by the runtype
                    continue;
                }
                this.singleValues.set(valueName, searchPath);
            }
        }
        if (this.config.constValues !== undefined) {
            for (const [valueName, value] of Object.entries(
                this.config.constValues,
            )) {
                if (Array.isArray(value)) {
                    this.serialConstants.set(valueName, value);
                    this.serialValuesCount = value.length; //stupid reassignment because the equality of all arrays is assured by the runtype
                    continue;
                }
                this.singleConstants.set(valueName, value);
            }
        }

        //subscribe variants
        const topicVariants = generateTopicVariants(this.config.topic);
        for (const topic of topicVariants) {
            this.subscriptions.push(
                this.mqtt
                    .mqttSubscribe(topic, this.config.qos as any)
                    .subscribe(this.onMessage.bind(this)),
            );
        }
    }

    /**
     * Generates the values map filled with the single constants values
     * @returns the values map
     */
    private getConstValuesMap(): Map<string, string> {
        return new Map<string, string>(this.singleConstants);
    }

    /**
     * Fills the timestamp map with the current timestamps
     * @param valuesMap the values map to fill
     */
    private getTimeStampMap(): Map<string, string> {
        const timeStampMap = new Map<string, string>();
        const now = `${Date.now() / 1000}`;
        if (this.config.timestampValues !== undefined) {
            for (const key of this.config.timestampValues) {
                timeStampMap.set(key, now);
            }
        }
        return timeStampMap;
    }

    /**
     * Fills the values map with the values defined from the mqtt topic
     * @param valuesMap the values map to fill
     * @param topic the topic to evaluate
     */
    private fillTopicValues(valuesMap: Map<string, string>, topic: string[]) {
        if (this.config.topicValues !== undefined) {
            const keys = this.config.topicValues.split("/");
            for (let i = 0; i <= topic.length && i <= keys.length; i++) {
                const value = topic[i];
                const key = keys[i];
                if (value !== undefined && key.length > 0 && key !== "_") {
                    valuesMap.set(key, value);
                }
            }
        }
    }

    /**
     * Fills the values map with the values delivered from the payload
     * @param valuesMap
     * @param payload
     */
    private fillSinglePayloadValues(
        valuesMap: Map<string, string>,
        payload: string,
    ) {
        try {
            if (this.singleValues.size > 0) {
                for (const [
                    valueName,
                    searchPath,
                ] of this.singleValues.entries()) {
                    const value = getValueFromPayload(searchPath, payload);
                    //TODO proof type of value
                    valuesMap.set(valueName, value);
                }
            }
            return valuesMap;
        } catch (e) {
            this.debug(`Error in fillSinglePayloadValues(): ${e}`);
        }
    }

    /**
     * Iterates over every combination of serial values (payload or constant)
     * @param valuesMap
     * @param payload
     * @returns
     */
    private *getSerialInserts(
        valuesMap: Map<string, string>,
        payload: string,
    ): Generator<Map<string, string>> {
        if (this.serialValuesCount === 0) {
            yield valuesMap;
            return;
        }

        //It is assured that all involved arrays have the same size
        for (let i = 0; i < this.serialValuesCount; i++) {
            const valuesMapCopy = new Map(valuesMap);
            for (const [
                valueName,
                searchPaths,
            ] of this.serialValues.entries()) {
                valuesMapCopy.set(
                    valueName,
                    getValueFromPayload(searchPaths[i], payload),
                );
            }
            for (const [valueName, value] of this.serialConstants.entries()) {
                valuesMapCopy.set(valueName, value[i]);
            }

            yield valuesMapCopy;
        }
    }

    private checkValueTime(topic: string) {
        if (this.config.minValueTimeDiffMS === undefined) {
            return true;
        }
        const now = Date.now();
        const old = this.valueTimes.get(topic);

        if (old === undefined || now - old >= this.config.minValueTimeDiffMS) {
            this.valueTimes.set(topic, now);
            return true;
        }

        return false;
    }

    onMessage(msg: Message) {
        if (!this.checkValueTime(msg.topic.join("/"))) {
            this.debug(`Skipped message for ${msg.topic}`);
            return;
        }
        this.debug("Not skipped");

        //get timestamp values
        const timeStamps = this.getTimeStampMap();

        //get single values
        //constants
        const keyValuePairs = this.getConstValuesMap();
        //topic values
        this.fillTopicValues(keyValuePairs, msg.topic);
        //single payload values
        this.fillSinglePayloadValues(keyValuePairs, msg.body);

        for (const keyValueCombination of this.getSerialInserts(
            keyValuePairs,
            msg.body,
        )) {
            const [query, values] = createQuery(
                this.config.table,
                keyValueCombination,
                timeStamps,
            );
            this.pool
                .query(query, values)
                .then(() => {
                    this.debug(`Executed query: ${query} | [${values}]`);
                })
                .catch((err) => {
                    this.debug(`Query failed: ${err}, ${query} | [${values}]`);
                });
        }
    }

    @MqttUnsubHook()
    destroy() {
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
