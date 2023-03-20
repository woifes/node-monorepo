// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { InfluxDB } from "@influxdata/influxdb-client";
import { Client } from "@woifes/mqtt-client";
import { Agent } from "http";
import { Item } from "./item/Item";
import { AgentConfig, tAgentConfig } from "./types/AgentConfig";

export class MqttInfluxDbAgent {
    private config: tAgentConfig;
    private items: Item[] = [];
    private influx: InfluxDB;
    private mqtt: Client;

    constructor(config: tAgentConfig) {
        this.config = AgentConfig.check(config);
        const keepAliveAgent = new Agent({
            keepAlive: true, // reuse existing connections
            keepAliveMsecs: 20 * 1000, // 20 seconds keep alive
        });
        this.influx = new InfluxDB({
            url: this.config.influx.url,
            token: this.config.influx.token,
            transportOptions: { agent: keepAliveAgent },
        });
        this.mqtt = new Client(this.config.mqtt);
        for (const itemConfig of this.config.items) {
            this.items.push(
                new Item(
                    itemConfig,
                    this.config.influx.organization,
                    this.influx,
                    this.mqtt
                )
            );
        }
        process.on("exit", () => {
            keepAliveAgent.destroy();
        });
    }
}
