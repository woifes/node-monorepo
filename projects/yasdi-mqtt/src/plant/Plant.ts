// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";
import { Inverter } from "../inverter/Inverter";
import { PlantConfig, rtPlantConfig } from "./PlantConfig";

export class Plant {
    private static getMqttTopicPrefix(this: Plant): string {
        return `${this.mqttTopicPrefix}/${this.config.name}`;
    }

    private config: PlantConfig;
    private mqtt: Client;
    private mqttTopicPrefix: string;
    private inverter: Inverter[] = [];

    constructor(config: PlantConfig, mqttTopicPrefix: string, mqtt: Client) {
        this.config = rtPlantConfig.check(config);
        this.mqttTopicPrefix = mqttTopicPrefix;
        this.mqtt = mqtt;
        for (const inverterConfig of this.config.inverter) {
            this.inverter.push(new Inverter(inverterConfig));
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

    onMqttConnect() {
        if (this.config.alias !== undefined) {
            this.mqtt.publishValueSync(
                `${Plant.getMqttTopicPrefix.call(this)}/alias`,
                this.config.alias,
            );
        }
        this.sendDeviceCount();
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
            `${Plant.getMqttTopicPrefix.call(this)}/deviceFound`,
            `${this.foundInverterCount}/${this.inverterCount}`,
        );
    }
}
