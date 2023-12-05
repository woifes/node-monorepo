// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";
import debug, { Debugger } from "debug";
import { Pool } from "pg";
import { Item } from "./item/Item";
import {
    MqttPostgresAgentConfig,
    rtMqttPostgresAgentConfig,
} from "./types/MqttPostgresAgentConfig";

export class MqttPostgresAgent {
    private config: MqttPostgresAgentConfig;
    private pool: Pool;
    private mqtt: Client;
    private items: Item[] = [];
    private debug: Debugger;

    constructor(config: MqttPostgresAgentConfig) {
        this.config = rtMqttPostgresAgentConfig.check(config);
        this.mqtt = new Client(this.config.mqtt);
        this.pool = new Pool(this.config.postgres as any); //because of the two unknown types this has to be done this way
        this.debug = debug("mqtt-postgres-agent");
        for (const itemConfig of this.config.items) {
            this.items.push(
                new Item(itemConfig, this.mqtt, this.pool, this.debug),
            );
        }
    }
}
