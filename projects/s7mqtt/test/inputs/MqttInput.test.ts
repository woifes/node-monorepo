// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

/* eslint-disable @typescript-eslint/no-namespace */

import { Client, Message } from "@woifes/mqtt-client";
import { S7RemoteEndpoint } from "@woifes/s7endpoint";
import { TestServer } from "@woifes/s7endpoint/test/TestServer";
import { MqttInput } from "../../src/inputs/MqttInput";

async function promiseTimeout(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const SERVER = new TestServer("127.0.0.1");
const S7ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
});
S7ENDP.connect();

let mqtt: Client;
function simIncMessage(msg: Message) {
    (mqtt as any).onMessageCallback(
        msg.topic.join("/"),
        Buffer.from(msg.body, "utf-8"),
        { qos: msg.qos, retain: msg.retain }
    );
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeBuffer(expected: string): CustomMatcherResult;
        }
    }
}

expect.extend({
    toBeBuffer(received: Buffer, expected: string): jest.CustomMatcherResult {
        const pass: boolean = received.equals(Buffer.from(expected, "hex"));
        const message: () => string = () =>
            pass
                ? ""
                : `Received Buffer (${received.toString(
                      "hex"
                  )}) is not the same as expected (${expected})`;

        return {
            message,
            pass,
        };
    },
});

afterAll(() => {
    SERVER.stop();
});

beforeEach(() => {
    mqtt = new Client({
        url: "localhost",
        clientId: "client01",
    });
    jest.clearAllMocks();
});

describe("Single target test", () => {
    it("should write on message", async () => {
        const i = new MqttInput(
            {
                target: { area: "DB", dbNr: 1, byteIndex: 0, type: "UINT32" },
                topic: "a/b/c",
            },
            S7ENDP,
            mqtt
        );
        await promiseTimeout(1000);
        SERVER.setArea(1, Buffer.alloc(4));
        const m1 = new Message("a/b/c/d", 0, false, "123", mqtt); //wrong topic
        const m2 = new Message("a/b/c", 0, false, "no number", mqtt); //wrong value
        const m3 = new Message("a/b/c", 0, false, "456", mqtt);
        simIncMessage(m1);
        await promiseTimeout(500);
        simIncMessage(m2);
        await promiseTimeout(500);
        simIncMessage(m3);
        await promiseTimeout(1000);
        expect(SERVER.getDbArea(1)).toBeBuffer("000001c8");
    });

    it("should write fallback on timeout", async () => {
        const i = new MqttInput(
            {
                target: {
                    area: "DB",
                    dbNr: 1,
                    byteIndex: 0,
                    type: "UINT32",
                    value: 123,
                },
                topic: "a/b/c",
                fallback: {
                    watchdogTimeMS: 1500,
                },
            },
            S7ENDP,
            mqtt
        );
        await promiseTimeout(1000);
        const m1 = new Message("a/b/c", 0, false, "456", mqtt);
        simIncMessage(m1);
        await promiseTimeout(1000);
        expect(SERVER.getDbArea(1)).toBeBuffer("000001c8");
        await promiseTimeout(1000);
        expect(SERVER.getDbArea(1)).toBeBuffer("0000007b");
    });

    it("should restart timeout if error during write", async () => {
        const i = new MqttInput(
            {
                target: {
                    area: "DB",
                    dbNr: 2,
                    byteIndex: 0,
                    type: "UINT32",
                    value: 123,
                },
                topic: "a/b/c",
                fallback: {
                    watchdogTimeMS: 1000,
                },
            },
            S7ENDP,
            mqtt
        );
        await promiseTimeout(1500);
        SERVER.setArea(2, Buffer.alloc(4));
        await promiseTimeout(1500);
        expect(SERVER.getDbArea(2)).toBeBuffer("0000007b");
    });
});

describe("Multi target test", () => {
    it("should write on message", async () => {
        const i = new MqttInput(
            {
                target: [
                    { area: "DB", dbNr: 101, byteIndex: 0, type: "UINT32" },
                    { area: "DB", dbNr: 102, byteIndex: 0, type: "UINT32" },
                    { area: "DB", dbNr: 103, byteIndex: 0, type: "UINT32" },
                ],
                topic: "a/b/c",
            },
            S7ENDP,
            mqtt
        );
        await promiseTimeout(300);
        SERVER.setArea(101, Buffer.alloc(4));
        SERVER.setArea(102, Buffer.alloc(4));
        SERVER.setArea(103, Buffer.alloc(4));
        let m1 = new Message("a/b/c", 0, false, "[123,456,789]", mqtt);
        simIncMessage(m1);
        await promiseTimeout(500);
        expect(SERVER.getDbArea(101)).toBeBuffer("0000007b");
        expect(SERVER.getDbArea(102)).toBeBuffer("000001c8");
        expect(SERVER.getDbArea(103)).toBeBuffer("00000315");

        m1 = new Message("a/b/c", 0, false, "[456,789]", mqtt);
        simIncMessage(m1);
        await promiseTimeout(500);
        expect(SERVER.getDbArea(101)).toBeBuffer("000001c8");
        expect(SERVER.getDbArea(102)).toBeBuffer("00000315");
        expect(SERVER.getDbArea(103)).toBeBuffer("00000315");

        m1 = new Message("a/b/c", 0, false, "[789]", mqtt);
        simIncMessage(m1);
        await promiseTimeout(500);
        expect(SERVER.getDbArea(101)).toBeBuffer("00000315");
        expect(SERVER.getDbArea(102)).toBeBuffer("00000315");
        expect(SERVER.getDbArea(103)).toBeBuffer("00000315");
    });

    it("should write on message when enough values", async () => {
        const i = new MqttInput(
            {
                target: [
                    { area: "DB", dbNr: 111, byteIndex: 0, type: "UINT32" },
                    { area: "DB", dbNr: 112, byteIndex: 0, type: "UINT32" },
                    { area: "DB", dbNr: 113, byteIndex: 0, type: "UINT32" },
                ],
                topic: "a/b/c",
                minTargetCount: 2,
            },
            S7ENDP,
            mqtt
        );
        await promiseTimeout(300);
        SERVER.setArea(111, Buffer.alloc(4));
        SERVER.setArea(112, Buffer.alloc(4));
        SERVER.setArea(113, Buffer.alloc(4));
        let m1 = new Message("a/b/c", 0, false, "[123,456,789]", mqtt);
        simIncMessage(m1);
        await promiseTimeout(500);
        expect(SERVER.getDbArea(111)).toBeBuffer("0000007b");
        expect(SERVER.getDbArea(112)).toBeBuffer("000001c8");
        expect(SERVER.getDbArea(113)).toBeBuffer("00000315");

        m1 = new Message("a/b/c", 0, false, "[456,789]", mqtt);
        simIncMessage(m1);
        await promiseTimeout(500);
        expect(SERVER.getDbArea(111)).toBeBuffer("000001c8");
        expect(SERVER.getDbArea(112)).toBeBuffer("00000315");
        expect(SERVER.getDbArea(113)).toBeBuffer("00000315");

        m1 = new Message("a/b/c", 0, false, "[789]", mqtt);
        simIncMessage(m1);
        await promiseTimeout(500);
        expect(SERVER.getDbArea(111)).toBeBuffer("000001c8");
        expect(SERVER.getDbArea(112)).toBeBuffer("00000315");
        expect(SERVER.getDbArea(113)).toBeBuffer("00000315");
    });

    it("should write fallback on timeout", async () => {
        const i = new MqttInput(
            {
                target: [
                    {
                        area: "DB",
                        dbNr: 201,
                        byteIndex: 0,
                        type: "UINT32",
                        value: 10,
                    },
                    {
                        area: "DB",
                        dbNr: 202,
                        byteIndex: 0,
                        type: "UINT32",
                        value: 11,
                    },
                    {
                        area: "DB",
                        dbNr: 203,
                        byteIndex: 0,
                        type: "UINT32",
                        value: 12,
                    },
                ],
                topic: "a/b/c",
                fallback: {
                    watchdogTimeMS: 1500,
                },
            },
            S7ENDP,
            mqtt
        );
        await promiseTimeout(300);
        SERVER.setArea(201, Buffer.alloc(4));
        SERVER.setArea(202, Buffer.alloc(4));
        SERVER.setArea(203, Buffer.alloc(4));
        const m1 = new Message("a/b/c", 0, false, "[123,456,789]", mqtt);
        simIncMessage(m1);
        await promiseTimeout(500);
        expect(SERVER.getDbArea(201)).toBeBuffer("0000007b");
        expect(SERVER.getDbArea(202)).toBeBuffer("000001c8");
        expect(SERVER.getDbArea(203)).toBeBuffer("00000315");

        await promiseTimeout(1200);
        expect(SERVER.getDbArea(201)).toBeBuffer("0000000A");
        expect(SERVER.getDbArea(202)).toBeBuffer("0000000B");
        expect(SERVER.getDbArea(203)).toBeBuffer("0000000C");
    });

    it("should restart timeout if error during write", async () => {
        const i = new MqttInput(
            {
                target: [
                    {
                        area: "DB",
                        dbNr: 301,
                        byteIndex: 0,
                        type: "UINT32",
                        value: 13,
                    },
                    {
                        area: "DB",
                        dbNr: 302,
                        byteIndex: 0,
                        type: "UINT32",
                        value: 14,
                    },
                    {
                        area: "DB",
                        dbNr: 303,
                        byteIndex: 0,
                        type: "UINT32",
                        value: 15,
                    },
                ],
                topic: "a/b/c",
                fallback: {
                    watchdogTimeMS: 1000,
                },
            },
            S7ENDP,
            mqtt
        );
        await promiseTimeout(1500);
        SERVER.setArea(301, Buffer.alloc(4));
        SERVER.setArea(302, Buffer.alloc(4));
        SERVER.setArea(303, Buffer.alloc(4));
        await promiseTimeout(1500);
        expect(SERVER.getDbArea(301)).toBeBuffer("0000000D");
        expect(SERVER.getDbArea(302)).toBeBuffer("0000000E");
        expect(SERVER.getDbArea(303)).toBeBuffer("0000000F");
    });
});
