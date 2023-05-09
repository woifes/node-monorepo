// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Inverter } from "../inverter/Inverter";
import { PlantConfig, rtPlantConfig } from "./PlantConfig";
import { Client } from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttConnection,
    MqttConnectionHandler,
} from "@woifes/mqtt-client/decorator";
import { NodeYasdi } from "@woifes/node-yasdi";

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
        this.mqttTopicPrefix = mqttTopicPrefix;
        this.mqtt = mqtt;
        for (const inverterConfig of this.config.inverter) {
            this.inverter.push(
                new Inverter(
                    inverterConfig,
                    this.nodeYasdi,
                    this.mqtt,
                    this.mqttTopicPrefix,
                    this.config.coordinates,
                    this.config.orientation,
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

    private getMqttPrefix(): string {
        return `${this.mqttTopicPrefix}/${this.config.name}`;
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
    }

    onDeviceSearchEnd(serials: number[]) {
        this.inverter.forEach((inverter) => {
            inverter.onDeviceSearchEnd(serials);
        });
    }

    private sendDeviceCount() {
        this.mqtt.publishValue(
            `${this.mqttTopicPrefix}/deviceFound`,
            `${this.foundInverterCount}/${this.inverterCount}`,
        );
    }
}
