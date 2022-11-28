// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import {
    AlarmDefinition,
    tAlarmDefinition,
} from "../../src/Alarm/AlarmDefinition";

let testDef: tAlarmDefinition;

beforeEach(() => {
    testDef = {
        autoAck: false,
        c: "cat01",
        cn: 1,
        text: "bad thing happened",
    };
});

it("should allow valid object", () => {
    expect(() => {
        AlarmDefinition.check(testDef);
    }).not.toThrow();
});

it("should now allow empty category", () => {
    testDef.c = "";
    expect(() => {
        AlarmDefinition.check(testDef);
    }).toThrow();
});

it("should not allow negative category number", () => {
    testDef.cn = -1;
    expect(() => {
        AlarmDefinition.check(testDef);
    }).toThrow();
});

it("should not allow to high category number", () => {
    testDef.cn = 256;
    expect(() => {
        AlarmDefinition.check(testDef);
    }).toThrow();
});

it("should not allow empty text", () => {
    testDef.text = "";
    expect(() => {
        AlarmDefinition.check(testDef);
    }).toThrow();
});
