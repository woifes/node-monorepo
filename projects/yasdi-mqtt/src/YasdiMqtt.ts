// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { NodeYasdi } from "@woifes/node-yasdi";
import { Plant } from "./plant/Plant";
import { rtYasdiMqttConfig, YasdiMqttConfig } from "./YasdiMqttConfig";
import { tmpdir } from "os";
import {
    MqttClient,
    MqttConnection,
    MqttConnectionHandler,
} from "@woifes/mqtt-client/decorator";
import { Client } from "@woifes/mqtt-client";

const YASDI_MQTT_SERIAL_DEVICE = "/dev/ttyUSB0";

@MqttClient()
export class YasdiMqtt {
    private config: YasdiMqttConfig;
    @MqttConnection() private mqtt: Client;
    private nodeYasdi: NodeYasdi;
    private plants: Plant[] = [];

    constructor(config: YasdiMqttConfig) {
        this.config = rtYasdiMqttConfig.check(config);

        this.mqtt = new Client(this.config.mqtt);

        for (const plantConfig of this.config.yasdi.plants) {
            this.plants.push(
                new Plant(
                    plantConfig,
                    this.config.yasdi.mqttPrefix ?? "tags",
                    this.mqtt,
                ),
            );
        }

        this.nodeYasdi = new NodeYasdi(this.config.name, {
            expectedDeviceCount: this.inverterCount,
            iniFileDir: tmpdir(),
            serialPorts: [YASDI_MQTT_SERIAL_DEVICE],
        });

        this.nodeYasdi.on("deviceSearchEnd", () => {
            this.plants.forEach((plant) => {
                plant.onDeviceSearchEnd(this.nodeYasdi.serials);
            });
        });
    }

    private get inverterCount(): number {
        let count = 0;
        this.plants.forEach((plant) => {
            count += plant.inverterCount;
        });
        return count;
    }

    @MqttConnectionHandler()
    onMqttConnect(connected: boolean) {
        if (connected) {
            this.plants.forEach((plant) => {
                plant.onMqttConnect();
            });
        }
    }
}
