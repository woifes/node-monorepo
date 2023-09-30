// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { EventEmitter } from "events";
import { Client, Message } from "@woifes/mqtt-client";
import { S7Endpoint } from "@woifes/s7endpoint";
import debug from "debug";
import { S7Event } from "../../src/events/S7Event";
import { S7EventMqtt } from "../../src/events/S7EventMqtt";
import { tS7EventMqttConfig } from "../../src/events/S7EventMqttConfig";
jest.mock("../../src/events/S7Event");
const S7EVENT_MOCK = S7Event as unknown as jest.Mock;
S7EVENT_MOCK.mockImplementation(() => {
    return new EventEmitter();
});

class MqttClientMock extends EventEmitter {
    publishMessage = jest.fn((msg: Message) => {
        this.emit("publishedMessage");
        return Promise.resolve();
    });
}

const DEBUGGER = debug("test");
const MQTT = new MqttClientMock();

const CONFIG: tS7EventMqttConfig = {
    trigger: "DB1,W4",
    params: ["DB12,DW0", "DB12,W4.3", "DB20,SInt2"],
    pollIntervalMS: 500,
    topic: "send/evt/to/topic",
};

beforeEach(() => {
    jest.clearAllMocks();
});

it("should send message on trigger without message set", async () => {
    const evtMqtt = new S7EventMqtt(
        CONFIG,
        {} as S7Endpoint,
        MQTT as unknown as Client,
        DEBUGGER,
    );
    const evt = (evtMqtt as any)._s7event;
    evt.emit(
        "trigger",
        { area: "DB", dbNr: 1, byteIndex: 4, type: "UINT16", value: 3 },
        [
            { area: "DB", dbNr: 12, byteIndex: 0, type: "UINT32", value: 123 },
            {
                area: "DB",
                dbNr: 12,
                byteIndex: 4,
                count: 3,
                type: "ARRAY_OF_INT16",
                value: [1, 2, 3],
            },
            { area: "DB", dbNr: 20, byteIndex: 2, type: "INT8", value: -7 },
        ],
    );
    expect(MQTT.publishMessage).toBeCalledTimes(1);
    const msg: Message = MQTT.publishMessage.mock.calls[0][0];
    expect(msg.topic).toEqual(["send", "evt", "to", "topic"]);
    expect(msg.qos).toBe(2);
    expect(msg.retain).toBe(false);
    expect(msg.body).toBe("[3,123,[1,2,3],-7]");
});

it("should send message on trigger with message set and no placeholder", async () => {
    const evtMqtt = new S7EventMqtt(
        {
            ...CONFIG,
            message: "Hello World",
        },
        {} as S7Endpoint,
        MQTT as unknown as Client,
        DEBUGGER,
    );
    const evt = (evtMqtt as any)._s7event;
    evt.emit(
        "trigger",
        { area: "DB", dbNr: 1, byteIndex: 4, type: "UINT16", value: 3 },
        [
            { area: "DB", dbNr: 12, byteIndex: 0, type: "UINT32", value: 123 },
            {
                area: "DB",
                dbNr: 12,
                byteIndex: 4,
                count: 3,
                type: "ARRAY_OF_INT16",
                value: [1, 2, 3],
            },
            { area: "DB", dbNr: 20, byteIndex: 2, type: "INT8", value: -7 },
        ],
    );
    expect(MQTT.publishMessage).toBeCalledTimes(1);
    const msg: Message = MQTT.publishMessage.mock.calls[0][0];
    expect(msg.topic).toEqual(["send", "evt", "to", "topic"]);
    expect(msg.qos).toBe(2);
    expect(msg.retain).toBe(false);
    expect(msg.body).toBe("Hello World");
});

it("should send message on trigger with message set and placeholder", async () => {
    const evtMqtt = new S7EventMqtt(
        {
            ...CONFIG,
            message: "$2 $1 $0 $t $3",
        },
        {} as S7Endpoint,
        MQTT as unknown as Client,
        DEBUGGER,
    );
    const evt = (evtMqtt as any)._s7event;
    evt.emit(
        "trigger",
        { area: "DB", dbNr: 1, byteIndex: 4, type: "UINT16", value: 3 },
        [
            { area: "DB", dbNr: 12, byteIndex: 0, type: "UINT32", value: 123 },
            {
                area: "DB",
                dbNr: 12,
                byteIndex: 4,
                count: 3,
                type: "ARRAY_OF_INT16",
                value: [1, 2, 3],
            },
            { area: "DB", dbNr: 20, byteIndex: 2, type: "INT8", value: -7 },
        ],
    );
    expect(MQTT.publishMessage).toBeCalledTimes(1);
    const msg: Message = MQTT.publishMessage.mock.calls[0][0];
    expect(msg.topic).toEqual(["send", "evt", "to", "topic"]);
    expect(msg.qos).toBe(2);
    expect(msg.retain).toBe(false);
    expect(msg.body).toBe("-7 [1,2,3] 123 3 $3");
});
