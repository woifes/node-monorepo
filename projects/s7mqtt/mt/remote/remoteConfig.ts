// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tS7MqttConfig } from "../../src/runtypes/S7MqttConfig";

export const CONFIG: tS7MqttConfig = {
    endpoint: {
        endpointIp: "192.168.11.109",
        rack: 2,
        slot: 1,
        selfRack: 10,
        selfSlot: 1,
        name: "remote01",
        reconnectTimeMS: 3000,
    },

    mqtt: {
        url: "localhost",
        clientId: "client01",
    },

    commands: [
        {
            name: "add",
            topicPrefix: "actions",
            cmdIdAddress: "DB1001,W0",
            params: ["DB1001,W2", "DB1001,W4", "DB1001,W6"],
            result: {
                trigger: "DB1001,W8",
                okFlagAddress: "DB1001,B10",
                params: ["DB1001,DI12"],
                pollIntervalMS: 500,
                topicPrefix: "results",
                timeoutMS: 2500,
            },
        },
        {
            name: "triggerEvent",
            cmdIdAddress: "DB1002,W0",
        },
        {
            name: "setOutputs",
            cmdIdAddress: "DB1003,W0",
        },
        {
            name: "setSignal",
            cmdIdAddress: "DB1004,W0",
            params: ["DB1004,I2"],
        },
        {
            name: "setAck",
            cmdIdAddress: "DB1005,W0",
            params: ["DB1005,I2"],
        },
    ],
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
            target: [
                { area: "DB", dbNr: 3001, byteIndex: 0, type: "UINT8" },
                { area: "DB", dbNr: 3001, byteIndex: 1, type: "UINT8" },
                { area: "DB", dbNr: 3001, byteIndex: 2, type: "UINT8" },
            ],
        },
    ],
    outputs: [
        {
            topicPrefix: "plc01",
            tags: {
                tag01: "DB4001,W0",
                tag02: "DB4001,W2",
                tag03: "DB4001,W4",
            },
        },
    ],
    alarms: {
        numOfAlarms: 3,
        traceFilePath: "a",
        presentAlarmsFilePath: "b",
        alarmDefsPath: "c",
        alarms: [
            {
                signal: "DB5001,X0.0",
                ackOut: "DB5001,X0.3",
                ackIn: "DB5001,X0.6",
            },
            {
                signal: "DB5001,X0.1",
                ackOut: "DB5001,X0.4",
                ackIn: "DB5001,X0.7",
            },
            {
                signal: "DB5001,X0.2",
                ackOut: "DB5001,X0.5",
                ackIn: "DB5001,X1.0",
            },
        ],
    },
};
