// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tAlarmHandlerConfig } from "@woifes/alarmhandler";
import { AlarmHandlerMqttConfig } from "../../src/runtypes/AlarmHandlerMqttConfig";

const ALARM_HANDLER_CONFIG_BASE: tAlarmHandlerConfig = {
    numOfAlarms: 3,
    traceFilePath: "path/to/trace",
    presentAlarmsFilePath: "path/to/pres",
    alarmDefsPath: "path/to/defs",
};

it("should validate correct runtype", () => {
    expect(() => {
        AlarmHandlerMqttConfig.check({
            ...ALARM_HANDLER_CONFIG_BASE,
            additionalNewAlarmTopics: [
                "messenger/to/room01",
                "messenger/to/room02",
            ],
            textCommand: {
                commandInTopic: "messenger/from",
                commandOutTopic: "messenger/to",
            },
        });
    }).not.toThrow();

    expect(() => {
        AlarmHandlerMqttConfig.check({ ...ALARM_HANDLER_CONFIG_BASE });
    }).not.toThrow();
});

it("should not allow empty string in additional new alarm topics", () => {
    expect(() => {
        AlarmHandlerMqttConfig.check({
            ...ALARM_HANDLER_CONFIG_BASE,
            additionalNewAlarmTopics: ["", "messenger/to/lara"],
        });
    }).toThrow();
});

it("should not allow empty array of additional new alarm topics", () => {
    expect(() => {
        AlarmHandlerMqttConfig.check({
            ...ALARM_HANDLER_CONFIG_BASE,
            additionalNewAlarmTopics: [],
        });
    }).toThrow();
});
