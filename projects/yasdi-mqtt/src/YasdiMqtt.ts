// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { YasdiMqttConfig, rtYasdiMqttConfig } from "./YasdiMqttConfig";
import { Plant } from "./plant/Plant";
import { Client } from "@woifes/mqtt-client";
import { NodeYasdi } from "@woifes/node-yasdi";

export class YasdiMqtt {
    private config: YasdiMqttConfig;
    private mqtt: Client;
    private nodeYasdi: NodeYasdi;
    private plants: Plant[] = [];

    constructor(config: YasdiMqttConfig, tmpDir: string, serialDevice: string) {
        this.config = rtYasdiMqttConfig.check(config);

        this.mqtt = new Client(this.config.mqtt);

        this.nodeYasdi = new NodeYasdi(this.config.name, {
            expectedDeviceCount: this.inverterCount,
            iniFileDir: tmpDir,
            serialPorts: [serialDevice],
        });

        for (const plantConfig of this.config.yasdi.plants) {
            this.plants.push(
                new Plant(
                    plantConfig,
                    this.config.yasdi.mqttPrefix ?? "tags",
                    this.mqtt,
                    this.nodeYasdi,
                ),
            );
        }

        this.nodeYasdi.on("deviceSearchEnd", () => {
            this.plants.forEach((plant) => {
                plant.onDeviceSearchEnd(this.nodeYasdi.serials);
            });
        });
    }

    private get inverterCount(): number {
        let count = 0;
        this.config.yasdi.plants.forEach((plant) => {
            count += plant.inverter.length;
        });
        return count;
    }
}
