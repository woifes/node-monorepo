// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";

const MQTT = new Client({
    url: "abc",
    clientId: "client01",
});
const INVERTER_MOCK = {};
const NODE_YASDI_MOCK = {
    getInverterBySerial: (serial: number) => {
        if (serial === 1234) {
            return INVERTER_MOCK;
        }
    },
};

describe("Creation tests", () => {});
describe("Search tests", () => {});
describe("Send data tests", () => {});
