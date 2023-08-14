// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttConnection,
    MqttConnectionHandler,
} from "@woifes/mqtt-client/decorator";
import { NodeYasdi } from "@woifes/node-yasdi";
import { Inverter } from "../inverter/Inverter";
import { postIntensity } from "../sun/postIntensity";
import { PlantConfig, rtPlantConfig } from "./PlantConfig";

@MqttClient()
export class Plant {
    private config: PlantConfig;
    private nodeYasdi: NodeYasdi;
    private mqtt: Client;
    private mqttTopicPrefix: string;
    private inverter: Inverter[] = [];

    constructor(
        config: PlantConfig,
        mqttTopicPrefix: string,
        @MqttConnection() mqtt: Client,
        nodeYasdi: NodeYasdi,
    ) {
        this.config = rtPlantConfig.check(config);
        this.nodeYasdi = nodeYasdi;
        this.mqttTopicPrefix = this.getMqttPrefix(mqttTopicPrefix);
        this.mqtt = mqtt;
        for (const inverterConfig of this.config.inverter) {
            this.inverter.push(
                new Inverter(
                    inverterConfig,
                    this.nodeYasdi,
                    this.mqtt,
                    this.mqttTopicPrefix,
                ),
            );
        }
    }

    get foundInverterCount(): number {
        return this.inverter.filter((inverter) => {
            return inverter.present;
        }).length;
    }

    get inverterCount(): number {
        return this.inverter.length;
    }

    private getMqttPrefix(mqttTopicPrefix: string): string {
        return `${mqttTopicPrefix}/${this.config.name}`;
    }

    @MqttConnectionHandler()
    onMqttConnect(connected: boolean) {
        if (connected) {
            if (this.config.alias !== undefined) {
                this.mqtt.publishValueSync(
                    `${this.mqttTopicPrefix}/alias`,
                    this.config.alias,
                );
            }
            this.sendDeviceCount();
        }
    }

    onNewDevice(serial: number) {
        this.inverter.forEach((inverter) => {
            inverter.onNewDevice(serial);
        });
        this.sendDeviceCount();
    }

    onDeviceSearchEnd(serials: number[]) {
        this.inverter.forEach((inverter) => {
            inverter.onDeviceSearchEnd(serials);
        });
        this.sendDeviceCount();
    }

    async publishData() {
        for (const inverter of this.inverter) {
            await inverter.publishData();
        }
        if (this.config.sunTraceInfo !== undefined) {
            await postIntensity(
                this.config.sunTraceInfo,
                `${this.mqttTopicPrefix}/sunIntensity`,
                this.mqtt,
            );
        }
    }

    private sendDeviceCount() {
        this.mqtt.publishValueSync(
            `${this.mqttTopicPrefix}/deviceFound`,
            `${this.foundInverterCount}/${this.inverterCount}`,
        );
    }
}
