// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { join } from "path";
import { readFileSync } from "fs-extra";
import { parse } from "yaml";
import { S7MqttConfig } from "../../src/runtypes/S7MqttConfig";

it("should validate example file", () => {
    const p1 = join(__dirname, "..", "..", "examples", "s7mqtt.example.yaml");
    const p2 = join(__dirname, "..", "..", "examples", "s7mqtt02.example.yaml");

    expect(() => {
        S7MqttConfig.check(parse(readFileSync(p1, "utf-8")));
    }).not.toThrow();

    expect(() => {
        S7MqttConfig.check(parse(readFileSync(p2, "utf-8")));
    }).not.toThrow();
});
