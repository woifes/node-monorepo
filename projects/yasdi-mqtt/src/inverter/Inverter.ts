// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";
import {
    NodeYasdi,
    YASDI_COM_STATUS_NAME,
    inverterValue,
} from "@woifes/node-yasdi";
import { postIntensity } from "../sun/postIntensity";
import { SunTraceInfo } from "../types/SunTraceInfo";
import { InverterConfig, rtInverterConfig } from "./InverterConfig";

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
    ) {
        this.config = rtInverterConfig.check(config);
        this.plantMqttTopicPrefix = mqttTopicPrefix;
        this.nodeYasdi = nodeYasdi;
        this.mqtt = mqtt;
        this.sunTraceInfo = this.config.suntraceInfo;
    }

    get present(): boolean {
        return this.found;
    }

    get mqttTopicPrefix(): string {
        return `${this.plantMqttTopicPrefix}/inverter/${this.config.id}`;
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

    private async postIntensity() {
        if (this.sunTraceInfo !== undefined) {
            await postIntensity(
                this.sunTraceInfo,
                `${this.mqttTopicPrefix}/sunIntensity`,
                this.mqtt,
            );
        }
    }

    async publishData() {
        const inverter = this.nodeYasdi.getInverterBySerial(
            this.config.serialNumber,
        );
        if (inverter !== undefined) {
            try {
                const result = await inverter.getData(0);
                if (inverter.comStatus === "online") {
                    for (const [valName, val] of result) {
                        this.publishInverterValue(valName, val);
                    }
                } else {
                    this.publishInverterValue(
                        YASDI_COM_STATUS_NAME,
                        result.get(YASDI_COM_STATUS_NAME)!,
                    );
                }
                await this.postIntensity();
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
        if (this.found || serials.indexOf(this.config.serialNumber) !== -1) {
            this.found = true;
            return;
        }
        //TODO debug, expection?
    }
}
