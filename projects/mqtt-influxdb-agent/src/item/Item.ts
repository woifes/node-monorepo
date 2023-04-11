// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { InfluxDB, Point, WriteApi } from "@influxdata/influxdb-client";
import { Client, Message } from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttConnection,
    MqttMsgHandler,
    tMqttMsgHandlerConfig,
} from "@woifes/mqtt-client/decorator";
import { Debugger } from "debug";
import { tInfluxDbDatatype } from "../types/InfluxDatatype";
import { ItemConfig, tItemConfig } from "./ItemConfig";

@MqttClient()
export class Item {
    private static msgConfig(this: Item): tMqttMsgHandlerConfig {
        return {
            topic: this.config.topic,
            throttleMS: this.config.minTimeDiffMS,
            qos: this.config.qos as any,
        };
    }

    private config: tItemConfig;
    private writeApi: WriteApi;
    private organization: string;
    private topicTags: string[] = [];
    private valueName: string;
    private datatype: tInfluxDbDatatype;
    private mqtt: Client;
    private debug: Debugger;

    constructor(
        config: tItemConfig,
        organization: string,
        influx: InfluxDB,
        @MqttConnection() mqtt: Client,
        parentDebug: Debugger,
    ) {
        this.config = ItemConfig.check(config);
        this.organization = organization;
        this.mqtt = mqtt;
        this.debug = parentDebug.extend(`Item: ${this.config.topic}`);
        this.writeApi = influx.getWriteApi(
            this.organization,
            this.config.bucket,
            this.config.precision,
        );
        if (this.config.topicTags !== undefined) {
            this.topicTags = this.config.topicTags.split("/");
        }
        this.valueName = this.config.valueName ?? "value";
        this.datatype = this.config.datatype ?? "float";
    }

    @MqttMsgHandler(Item.msgConfig)
    private onMsg(msg: Message) {
        const rawJson = msg.readJSON();
        const now = Date.now();
        try {
            const point = new Point(this.config.measurement);
            point.timestamp(now);
            this.searchAndAddValueToPoint(rawJson, point);
            this.addTopicTagsToPoint(msg.topic, point);
            this.writeApi.writePoint(point);
        } catch (e) {
            this.debug(`Error in onMsg(): ${JSON.stringify(e)}`);
        }
    }

    private searchAndAddValueToPoint(rawValue: any, point: Point) {
        let value = rawValue;
        if (this.config.searchPath !== undefined) {
            for (const key of this.config.searchPath) {
                value = value[key];
            }
        }
        if (!Array.isArray(value)) {
            this.addValueToPoint(value, this.valueName, point);
        } else {
            for (let i = 0; i < value.length; i++) {
                const v = value[i];
                this.addValueToPoint(v, `${this.valueName}${i + 1}`, point);
            }
        }
    }

    private addValueToPoint(value: any, valueName: string, point: Point) {
        switch (this.datatype) {
            case "int":
                point.intField(valueName, value);
                break;
            case "uint":
                point.uintField(valueName, value);
                break;
            case "float":
                point.floatField(valueName, value);
                break;
            case "boolean":
                point.booleanField(valueName, value);
                break;
        }
    }

    private addTopicTagsToPoint(topic: string[], point: Point) {
        for (let i = 0; i <= topic.length && i <= this.topicTags.length; i++) {
            const topicElement = topic[i];
            const tagName = this.topicTags[i];
            if (tagName !== undefined && tagName !== "_") {
                point.tag(tagName, topicElement);
            }
        }
    }
}
