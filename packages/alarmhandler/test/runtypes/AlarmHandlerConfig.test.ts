// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { readFileSync } from "fs-extra";
import { parse } from "json5";
import { join } from "path";
import { AlarmHandlerConfig } from "../../src/runtypes/AlarmHandlerConfig";
const CONFIG_EXAMPLE = parse(
    readFileSync(join(__dirname, "..", "..", "config.example.jsonc"), "utf-8")
);

it("should validate correct runtype", () => {
    expect(() => {
        AlarmHandlerConfig.check({
            numOfAlarms: 3,
            traceFilePath: "path/to/trace",
            presentAlarmsFilePath: "path/to/pres",
        });
    }).not.toThrow();
    expect(() => {
        AlarmHandlerConfig.check({
            numOfAlarms: 3,
            traceFilePath: "path/to/trace",
            presentAlarmsFilePath: "path/to/pres",
            alarmDefsPath: "path/to/defs",
        });
    }).not.toThrow();
});

it("should validate example file", () => {
    expect(() => {
        AlarmHandlerConfig.check(CONFIG_EXAMPLE);
    }).not.toThrow();
});

it("should not allow negative number of alarms", () => {
    expect(() => {
        AlarmHandlerConfig.check({
            numOfAlarms: -1,
            traceFilePath: "path/to/trace",
            presentAlarmsFilePath: "path/to/pres",
            alarmDefsPath: "path/to/defs",
        });
    }).toThrow();
});

it("should not allow empty trace file path", () => {
    expect(() => {
        AlarmHandlerConfig.check({
            numOfAlarms: 3,
            traceFilePath: "",
            presentAlarmsFilePath: "path/to/pres",
            alarmDefsPath: "path/to/defs",
        });
    }).toThrow();
});

it("should not allow empty present alarms path", () => {
    expect(() => {
        AlarmHandlerConfig.check({
            numOfAlarms: 3,
            traceFilePath: "path/to/trace",
            presentAlarmsFilePath: "",
            alarmDefsPath: "path/to/defs",
        });
    }).toThrow();
});

it("should not allow empty alarm defs path", () => {
    expect(() => {
        AlarmHandlerConfig.check({
            numOfAlarms: 3,
            traceFilePath: "path/to/trace",
            presentAlarmsFilePath: "path/to/pres",
            alarmDefsPath: "",
        });
    }).toThrow();
});
