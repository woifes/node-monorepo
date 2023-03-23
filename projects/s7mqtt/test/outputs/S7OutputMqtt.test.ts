// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client, Message } from "@woifes/mqtt-client";
import { S7RemoteEndpoint } from "@woifes/s7endpoint";
import debug from "debug";
import { EventEmitter } from "events";
import { tS7OutputMqttConfig } from "projects/s7mqtt/src/outputs/S7OutputMqttConfig";
import { S7Output } from "../../src/outputs/S7Output";
import { S7OutputMqtt } from "../../src/outputs/S7OutputMqtt";
jest.mock("../../src/outputs/S7Output");
const S7OUT_MOCK = S7Output as unknown as jest.Mock;
S7OUT_MOCK.mockImplementation(() => {
    return new EventEmitter();
});

async function promiseTimeout(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

class MqttClientMock extends EventEmitter {
    constructor() {
        super();
    }

    publishMessageSync = jest.fn((msg: Message) => {
        this.emit("publishedMessage");
        return Promise.resolve();
    });
}

const DEBUGGER = debug("test");
const S7ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
});

const MQTT = new MqttClientMock();

const CONFIG: tS7OutputMqttConfig = {
    tags: {
        a: "DB1,W4",
        b: "DB12,DW0",
        c: "DB12,I4.3",
        d: "DB20,SInt2",
    },
    topicPrefix: "values",
    qos: 1,
    retain: true,
};

beforeEach(() => {
    jest.clearAllMocks();
});

it("should send values on data", async () => {
    const s7outmqtt = new S7OutputMqtt(
        CONFIG,
        S7ENDP,
        MQTT as unknown as Client,
        DEBUGGER
    );
    const s7out = (s7outmqtt as any)._s7out;
    s7out.emit("data", [
        { name: "a", dbNr: 1, byteIndex: 4, type: "UINT16", value: 1 },
        { name: "b", dbNr: 12, byteIndex: 0, type: "UINT32", value: 2 },
        {
            name: "c",
            dbNr: 12,
            byteIndex: 4,
            count: 3,
            type: "INT16",
            value: [3, 4, 5],
        },
        { name: "d", dbNr: 20, byteIndex: 2, type: "INT8", value: 6 },
    ]);
    await promiseTimeout(100);
    expect(MQTT.publishMessageSync).toBeCalledTimes(4);
    let msg = MQTT.publishMessageSync.mock.calls[0][0];
    expect(msg.topic).toEqual(["values", "a"]);
    expect(msg.body).toBe("1");
    expect(msg.qos).toBe(1);
    expect(msg.retain).toBe(true);

    msg = MQTT.publishMessageSync.mock.calls[1][0];
    expect(msg.topic).toEqual(["values", "b"]);
    expect(msg.body).toBe("2");

    msg = MQTT.publishMessageSync.mock.calls[2][0];
    expect(msg.topic).toEqual(["values", "c"]);
    expect(msg.body).toBe("[3,4,5]");

    msg = MQTT.publishMessageSync.mock.calls[3][0];
    expect(msg.topic).toEqual(["values", "d"]);
    expect(msg.body).toBe("6");
});

it("should use standard config", async () => {
    const config: tS7OutputMqttConfig = {
        tags: {
            a: "DB1,W4",
        },
    };
    const s7outmqtt = new S7OutputMqtt(
        config,
        S7ENDP,
        MQTT as unknown as Client,
        DEBUGGER
    );
    const s7out = (s7outmqtt as any)._s7out;
    s7out.emit("data", {
        a: { name: "a", dbNr: 1, byteIndex: 4, type: "UINT16", value: 1 },
    });
    await promiseTimeout(100);
    expect(MQTT.publishMessageSync).toBeCalledTimes(1);
    const msg = MQTT.publishMessageSync.mock.calls[0][0];
    expect(msg.topic).toEqual(["tags", "a"]);
    expect(msg.body).toBe("1");
    expect(msg.qos).toBe(0);
    expect(msg.retain).toBe(false);
});
