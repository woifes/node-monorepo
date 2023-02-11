// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tS7MqttConfig } from "../../src/runtypes/S7MqttConfig";

export const CONFIG: tS7MqttConfig = {
    endpoint: {
        name: "local01",
        datablockCsvDir: "a",
        allowArrayTypesInCsv: false,
    },

    mqtt: {
        url: "localhost",
        clientId: "client01",
    },

    events: [
        {
            topic: "a/b/c",
            trigger: "DB2001,W0",
            params: ["DB2001,I2", "DB2001,I4", "DB2001,I6"],
            pollIntervalMS: 500,
        },
    ],
    inputs: [
        {
            topic: "inputs/first",
            target: "DB3001,B0",
        },
    ],
    outputs: [
        {
            topicPrefix: "plc01",
            tags: {
                tag01: "DB4001,W0",
            },
        },
    ],
};
