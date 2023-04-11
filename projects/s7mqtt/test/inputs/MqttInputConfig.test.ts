// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "fs-extra";
import { join } from "path";
import { parse } from "yaml";
import { MqttInputConfig } from "../../src/inputs/MqttInputConfig";

it("should validate example file", () => {
    const p1 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "inputs",
        "mqttinput.example.yaml",
    );
    const p2 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "inputs",
        "mqttinput02.example.yaml",
    );
    expect(() => {
        MqttInputConfig.check(parse(readFileSync(p1, "utf-8")));
    }).not.toThrow();
    expect(() => {
        MqttInputConfig.check(parse(readFileSync(p2, "utf-8")));
    }).not.toThrow();
});

it("should validate correct runtype", () => {
    expect(() => {
        MqttInputConfig.check({
            topic: "a/b/c",
            target: "DB1,B0",
        });
    }).not.toThrow();
    expect(() => {
        MqttInputConfig.check({
            topic: "a/b/c",
            target: ["DB1,B0", "DB2,B0", "DB3,B0"],
        });
    }).not.toThrow();

    expect(() => {
        MqttInputConfig.check({
            topic: "a/b/c",
            target: {
                address: "DB1,B0",
                fallbackValue: 1,
            },
            fallback: {
                watchdogTimeMS: 123,
            },
        });
    }).not.toThrow();
    expect(() => {
        MqttInputConfig.check({
            topic: "a/b/c",
            target: [
                { address: "DB1,B0", fallbackValue: 1 },
                { address: "DB2,B0", fallbackValue: 1 },
                { address: "DB3,B0", fallbackValue: 1 },
            ],
            minTargetCount: 2,
            fallback: {
                watchdogTimeMS: 123,
            },
        });
    }).not.toThrow();
});

it("should not allow emtpy string as topic", () => {
    expect(() => {
        MqttInputConfig.check({
            topic: "",
            target: "DB1,B0",
        });
    }).toThrow();
});

it("should not allow negative watchdogTime", () => {
    expect(() => {
        MqttInputConfig.check({
            topic: "a/b/c",
            target: {
                address: "DB1,B0",
                fallbackValue: 1,
            },
            fallback: {
                watchdogTimeMS: -1,
            },
        });
    }).toThrow();
});

it("should not allow fallback without value set on target", () => {
    expect(() => {
        MqttInputConfig.check({
            topic: "a/b/c",
            target: "DB1,B0",
            fallback: {
                watchdogTimeMS: 123,
            },
        });
    }).toThrow();

    expect(() => {
        MqttInputConfig.check({
            topic: "a/b/c",
            target: [
                { address: "DB1,B0", fallbackValue: 1 },
                "DB2,B0",
                { address: "DB3,B0", fallbackValue: 1 },
            ],
            minTargetCount: 2,
            fallback: {
                watchdogTimeMS: 123,
            },
        });
    }).toThrow();
});

it("should not allow minTargetCount bigger than target count", () => {
    expect(() => {
        MqttInputConfig.check({
            topic: "a/b/c",
            target: ["DB1,B0", "DB2,B0", "DB3,B0"],
            minTargetCount: 4,
        });
    }).toThrow();
});
