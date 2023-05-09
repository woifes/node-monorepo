// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Coordinates } from "../types/Coordinates";
import { Orientation } from "../types/Orientation";
import { SunTraceInfo } from "../types/SunTraceInfo";
import { InverterConfig, rtInverterConfig } from "./InverterConfig";
import { Client } from "@woifes/mqtt-client";
import { NodeYasdi, inverterValue } from "@woifes/node-yasdi";

export class Inverter {
    private config: InverterConfig;
    private plantMqttTopicPrefix: string;
    private nodeYasdi: NodeYasdi;
    private mqtt: Client;
    private found = false;
    private sunTraceInfo?: SunTraceInfo;

    constructor(
        config: InverterConfig,
        nodeYasdi: NodeYasdi,
        mqtt: Client,
        mqttTopicPrefix: string,
        coordinates?: Coordinates,
        orientation?: Orientation,
    ) {
        this.config = rtInverterConfig.check(config);
        this.plantMqttTopicPrefix = mqttTopicPrefix;
        this.nodeYasdi = nodeYasdi;
        this.mqtt = mqtt;
        const cords = this.config.coordinates ?? coordinates;
        const orien = this.config.orientation ?? orientation;
        if (cords !== undefined && orien !== undefined) {
            this.sunTraceInfo = {
                coordinates: cords,
                orientation: orien,
            };
        }
    }

    get present(): boolean {
        return this.found;
    }

    get mqttTopicPrefix(): string {
        return `${this.plantMqttTopicPrefix}/${this.config.id}`;
    }

    private publishInverterValue(valName: string, val: inverterValue) {
        this.mqtt.publishValueSync(
            `${this.mqttTopicPrefix}/${valName}`,
            val.value,
        );
        this.mqtt.publishValueSync(
            `${this.mqttTopicPrefix}/${valName}/unit`,
            val.unit,
        );

        this.mqtt.publishValueSync(
            `${this.mqttTopicPrefix}/${valName}/timeStamp`,
            val.timeStamp,
        );
        this.mqtt.publishValueSync(
            `${this.mqttTopicPrefix}/${valName}/statusText`,
            val.statusText,
        );
    }

    async publishData() {
        const inverter = this.nodeYasdi.getInverterBySerial(
            this.config.serialNumber,
        );
        if (inverter !== undefined) {
            try {
                const result = await inverter.getData(0);
                for (const [valName, val] of result) {
                    this.publishInverterValue(valName, val);
                }
                //TODO sun trace info?
            } catch {
                //TODO
            }
        }
    }

    onNewDevice(serial: number) {
        if (this.config.serialNumber === serial) {
            this.found = true;
        }
    }

    onDeviceSearchEnd(serials: number[]) {
        if (this.found || this.config.serialNumber in serials) {
            this.found = true;
            return;
        }
        //TODO debug, expection?
    }
}
