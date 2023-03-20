// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import { AgentConfig } from "../../src/types/AgentConfig";

it("should validate example", () => {
    const config = parse(
        readFileSync(
            join(
                __dirname,
                "..",
                "..",
                "examples",
                "MqttInfluxDbAgent.example.yaml"
            ),
            "utf-8"
        )
    );
    expect(() => {
        AgentConfig.check(config);
    }).not.toThrow();
});
