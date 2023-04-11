// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "fs-extra";
import { join } from "path";
import { parse } from "yaml";
import { S7OutputMqttConfig } from "../../src/outputs/S7OutputMqttConfig";

it("should validate example file", () => {
    const p1 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "outputs",
        "outputmqtt.example.yaml",
    );

    expect(() => {
        S7OutputMqttConfig.check(parse(readFileSync(p1, "utf-8")));
    }).not.toThrow();
});

it("should validate correct runtype", () => {
    expect(() => {
        S7OutputMqttConfig.check({
            topicPrefix: "plc01",
            qos: 0,
            retain: true,
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [{ dbNr: 1, filePathOrContent: "path/to/file" }],
            pollIntervalMS: 123,
        });
    }).not.toThrow();

    expect(() => {
        S7OutputMqttConfig.check({
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [{ dbNr: 1, filePathOrContent: "path/to/file" }],
        });
    }).not.toThrow();
});

it("should not allow empty topicprefix", () => {
    expect(() => {
        S7OutputMqttConfig.check({
            topicPrefix: "",
            qos: 0,
            retain: true,
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [{ dbNr: 1, filePathOrContent: "path/to/file" }],
            pollIntervalMS: 123,
        });
    }).toThrow();
});

it("should only allow 0, 1 or 2 as qos", () => {
    expect(() => {
        S7OutputMqttConfig.check({
            qos: 0,
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [{ dbNr: 1, filePathOrContent: "path/to/file" }],
        });
    }).not.toThrow();
    expect(() => {
        S7OutputMqttConfig.check({
            qos: 1,
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [{ dbNr: 1, filePathOrContent: "path/to/file" }],
        });
    }).not.toThrow();
    expect(() => {
        S7OutputMqttConfig.check({
            qos: 2,
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [{ dbNr: 1, filePathOrContent: "path/to/file" }],
        });
    }).not.toThrow();

    expect(() => {
        S7OutputMqttConfig.check({
            qos: -1,
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [{ dbNr: 1, filePathOrContent: "path/to/file" }],
        });
    }).toThrow();
    expect(() => {
        S7OutputMqttConfig.check({
            qos: 3,
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [{ dbNr: 1, filePathOrContent: "path/to/file" }],
        });
    }).toThrow();
});
