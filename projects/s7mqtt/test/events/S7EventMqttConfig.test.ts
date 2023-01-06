// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "fs-extra";
import { join } from "path";
import { parse } from "yaml";
import { S7EventMqttConfig } from "../../src/events/S7EventMqttConfig";

it("should validate example file", () => {
    const p1 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "events",
        "mqttevent.example.yaml"
    );
    expect(() => {
        S7EventMqttConfig.check(parse(readFileSync(p1, "utf-8")));
    }).not.toThrow();
});

it("should validate correct runtype", () => {
    expect(() => {
        S7EventMqttConfig.check({
            trigger: "DB1,W4",
            topic: "a/b/c",
            message: "Hello World",
        });
    }).not.toThrow();

    expect(() => {
        S7EventMqttConfig.check({
            trigger: "DB1,W4",
            topic: "a/b/c",
        });
    }).not.toThrow();
});

it("should not allow empty topic", () => {
    expect(() => {
        S7EventMqttConfig.check({
            trigger: "DB1,W4",
            topic: "",
        });
    }).toThrow();
});
