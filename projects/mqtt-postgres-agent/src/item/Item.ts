// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { get } from "@woifes/gjson";
import { Client, Message } from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttConnection,
    MqttMsgHandler,
    MqttUnsubHook,
    tMqttMsgHandlerConfig,
} from "@woifes/mqtt-client/decorator";
import { Debugger } from "debug";
import { Pool } from "pg";
import { ItemConfig, rtItemConfig } from "./ItemConfig";
import { createQuery } from "./createQuery";

@MqttClient()
export class Item {
    static mqttMsgHandlerConfig(this: Item): tMqttMsgHandlerConfig {
        return {
            topic: this.config.topic,
            qos: this.config.qos as any,
            throttleMS: this.config.minTimeDiffMS,
        };
    }

    private config: ItemConfig;
    private mqtt: Client;
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
    }

    /**
     * Generates the values map filled with the constants values
     * @returns the values map
     */
    private getConstValuesMap(): Map<string, string> {
        const valuesMap = new Map<string, string>();
        if (this.config.constValues !== undefined) {
            for (const [key, value] of Object.entries(
                this.config.constValues,
            )) {
                valuesMap.set(key, value);
            }
        }
        return valuesMap;
    }

    /**
     * Fills the values map with the current timestamp
     * @param valuesMap the values map to fill
     */
    private fillTimestampValues(valuesMap: Map<string, string>) {
        if (this.config.timestampValues !== undefined) {
            const now = new Date().toUTCString();
            for (const key of this.config.timestampValues) {
                valuesMap.set(key, String(now));
            }
        }
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
    private fillPayloadValues(valuesMap: Map<string, string>, payload: string) {
        try {
            if (this.config.payloadValues !== undefined) {
                for (const [key, searchPath] of Object.entries(
                    this.config.payloadValues,
                )) {
                    let value: string;
                    if (searchPath === "@this") {
                        value = payload; //TODO remove when "@woifes/gjson" supports the @this
                    } else {
                        value = String(get(payload, searchPath));
                    }
                    //TODO proof type of value
                    //TODO allow array values for multiple inserts
                    valuesMap.set(key, value);
                }
            }
        } catch {
            //debug
        }
    }

    @MqttMsgHandler(Item.mqttMsgHandlerConfig)
    onMessage(msg: Message) {
        const keyValuePairs = this.getConstValuesMap();
        //get timestamp values
        this.fillTimestampValues(keyValuePairs);
        //get topic values
        this.fillTopicValues(keyValuePairs, msg.topic);
        //get payload values
        this.fillPayloadValues(keyValuePairs, msg.body);
        const [query, values] = createQuery(this.config.table, keyValuePairs);
        this.pool
            .query(query, values)
            .then(() => {
                this.debug(`Executed query: ${query} | [${values}]`);
            })
            .catch((err) => {
                this.debug(`Query failed: ${err}, ${query} | [${values}]`);
            });
    }

    @MqttUnsubHook()
    destroy() {}
}
