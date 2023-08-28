// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { inverterValues } from "@woifes/node-yasdi";

const inverter01 = {
    serial: 123,
    name: "inv01",
    type: "MyInverterType",

    getData: async function (): Promise<inverterValues> {
        const valueMap: inverterValues = new Map();
        valueMap.set("val01", {
            value: 1,
            unit: "unit01",
            statusText: "statusText01",
            timeStamp: "timestamp01",
        });
        valueMap.set("val02", {
            value: 2,
            unit: "unit02",
            statusText: "statusText02",
            timeStamp: "timestamp02",
        });
        valueMap.set("val03", {
            value: 3,
            unit: "unit03",
            statusText: "statusText03",
            timeStamp: "timestamp03",
        });
        return Promise.resolve(valueMap);
    },
};

const inverter02 = {
    serial: 456,
    name: "inv02",
    type: "MyInverterType",

    getData: async function (): Promise<inverterValues> {
        const valueMap: inverterValues = new Map();
        return Promise.reject("Mock Error");
    },
};

export class NodeYasdi {
    deviceSearchFinished = false;
    serials = [];
    getInverterBySerial(serial: number) {
        if (serial === 123) {
            return inverter01;
        } else if (serial === 456) {
            return inverter02;
        }
        return undefined;
    }
}
