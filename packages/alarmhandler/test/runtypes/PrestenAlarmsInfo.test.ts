// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import {
    PresentAlarmsInfo,
    tPresentAlarmsInfo,
} from "../../src/runtypes/PresentAlarmsInfo";

const d1 = new Date(2020, 11, 24, 7, 10, 30, 123);
const d2 = new Date(2020, 11, 24, 7, 15, 30, 123);
const d3 = new Date(2020, 11, 24, 7, 20, 30, 123);
let testInfo: tPresentAlarmsInfo;

beforeEach(() => {
    testInfo = {
        time: new Date().toJSON(),
        alarms: {
            1: { category: "a", categoryNum: 1, text: "abc" },
            2: {
                category: "a",
                categoryNum: 1,
                text: "abc",
                occurred: d1.toJSON(),
            },
            3: {
                category: "a",
                categoryNum: 1,
                text: "abc",
                occurred: d2.toJSON(),
                ackTime: d3.toJSON(),
            },
        },
    };
});

it("should validate correct object", () => {
    expect(() => {
        PresentAlarmsInfo.check(testInfo);
    }).not.toThrow();
});

it("should validate incorrect time", () => {
    testInfo.time = "no parseable time";
    expect(() => {
        PresentAlarmsInfo.check(testInfo);
    }).toThrow();
});
