// SPDX-FileCopyrightText: © 2024 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import {
    MqttPostgresAgentConfig,
    rtMqttPostgresAgentConfig,
} from "../src/types/MqttPostgresAgentConfig";

let config: MqttPostgresAgentConfig;

it("should validate the currently provided example", () => {
    config = parse(
        readFileSync(
            join(__dirname, "..", "examples", "MqttPostgresAgent.example.yaml"),
            "utf-8",
        ),
    );
    expect(() => {
        rtMqttPostgresAgentConfig.check(config);
    }).not.toThrow();
});
