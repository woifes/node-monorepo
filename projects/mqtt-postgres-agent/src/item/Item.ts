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
    private oldValues: Map<string, string> = new Map();

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
     * Creates a map of the topic values for the given topic
     */
    private getTopicValues(topic: string[]): Map<string, string> {
        const topicValuesMap = new Map<string, string>();
        if (this.config.topicValues !== undefined) {
            const keys = this.config.topicValues.split("/");
            for (let i = 0; i <= topic.length && i <= keys.length; i++) {
                const value = topic[i];
                const key = keys[i];
                if (value !== undefined && key.length > 0 && key !== "_") {
                    topicValuesMap.set(key, value);
                }
            }
        }
        return topicValuesMap;
    }

    /**
     * Creates a map of the single payload values for the given payload
     * @param payload
     * @returns
     */
    private getSinglePayloadValuesMap(payload: string): Map<string, string> {
        const valuesMap = new Map<string, string>();

        if (this.singleValues.size > 0) {
            for (const [valueName, searchPath] of this.singleValues.entries()) {
                const value = getValueFromPayload(searchPath, payload);
                //TODO proof type of value
                valuesMap.set(valueName, value);
            }
        }
        return valuesMap;
    }

    /**
     * Creates a map of the serial values for the given payload
     * @param payload
     * @returns
     */
    private getSerialValuesMap(payload: string): Map<string, string[]> {
        const serialValuesMap = new Map<string, string[]>();
        for (let i = 0; i < this.serialValuesCount; i++) {
            for (const [
                valueName,
                searchPaths,
            ] of this.serialValues.entries()) {
                const values: string[] = [];
                for (const searchPath of searchPaths) {
                    values.push(getValueFromPayload(searchPath, payload));
                }
                serialValuesMap.set(valueName, values);
            }
        }
        return serialValuesMap;
    }

    /**
     * Iterates over every combination of serial values (payload or constant)
     * @param valuesMap
     * @param payload
     * @returns
     */
    private *getSerialInserts(
        valuesMap: Map<string, string>,
        serialValuesMap: Map<string, string[]>,
    ): Generator<Map<string, string>> {
        if (serialValuesMap.size === 0) {
            yield valuesMap;
            return;
        }

        //It is assured that all involved arrays have the same size
        for (let i = 0; i < this.serialValuesCount; i++) {
            const valuesMapCopy = new Map(valuesMap);
            for (const [valueName, values] of serialValuesMap.entries()) {
                valuesMapCopy.set(valueName, values[i]);
            }
            for (const [valueName, values] of this.serialConstants.entries()) {
                valuesMapCopy.set(valueName, values[i]);
            }

            yield valuesMapCopy;
        }
    }

    /**
     * Checks the given values for a change
     * @param topic
     * @param newSingleValues
     * @param newSerialValues
     * @returns
     */
    private checkValueChange(
        topic: string,
        newSingleValues: Map<string, string>,
        newSerialValues: Map<string, string[]>,
    ): boolean {
        if (this.config.writeOnlyOnChange !== true) {
            return true;
        }
        const newValueString = JSON.stringify(
            Array.from(
                new Map<string, any>([
                    ...newSingleValues,
                    ...newSerialValues,
                ]).entries(),
            ),
        );
        const oldValueString = this.oldValues.get(topic);
        if (oldValueString !== newValueString) {
            this.oldValues.set(topic, newValueString);
            return true;
        }
        return false;
    }

    /**
     * Checks the value age
     * @param topic
     * @returns
     */
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
            this.debug(
                `Skipped message for ${msg.topic}, because the value is too new`,
            );
            return;
        }

        const singlePayloadValuesMap = this.getSinglePayloadValuesMap(msg.body);
        const serialValuesMap = this.getSerialValuesMap(msg.body);
        if (
            !this.checkValueChange(
                msg.topic.join("/"),
                singlePayloadValuesMap,
                serialValuesMap,
            )
        ) {
            this.debug(
                `Skipped message for ${msg.topic}, because no change in the values`,
            );
            return;
        }

        const timeStamps = this.getTimeStampMap();

        const constValuesMap = this.getConstValuesMap();

        const topicValuesMap = this.getTopicValues(msg.topic); //this.fillTopicValues(keyValuePairs, msg.topic);

        const keyValuePairs = new Map([
            ...constValuesMap,
            ...topicValuesMap,
            ...singlePayloadValuesMap,
        ]);

        for (const keyValueCombination of this.getSerialInserts(
            keyValuePairs,
            serialValuesMap,
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
