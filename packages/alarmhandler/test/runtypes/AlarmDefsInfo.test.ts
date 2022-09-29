// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import {
    AlarmDefsInfo,
    tAlarmDefsInfo,
} from "../../src/runtypes/AlarmDefsInfo";

let testDefInfo: tAlarmDefsInfo;

beforeEach(() => {
    testDefInfo = {
        1: {
            autoAck: false,
            c: "cat01",
            cn: 1,
            text: "bad thing",
        },
    };
});

it("should validate correct object", () => {
    expect(() => {
        AlarmDefsInfo.check(testDefInfo);
    }).not.toThrow();
});

it("should not validate negative number", () => {
    testDefInfo[-1] = {
        autoAck: false,
        c: "cat01",
        cn: 2,
        text: "bad thing2",
    };
    expect(() => {
        AlarmDefsInfo.check(testDefInfo);
    }).toThrow();
});
