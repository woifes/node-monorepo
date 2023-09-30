// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { once } from "events";
import { Client, Message } from "@woifes/mqtt-client";
import { S7RemoteEndpoint } from "@woifes/s7endpoint";
import { TestServer } from "@woifes/s7endpoint/test/TestServer";
import debug from "debug";
import { S7Command } from "../../src/commands/S7Command";
import { tS7CommandConfig } from "../../src/commands/S7CommandConfig";

async function promiseTimeout(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const DEBUGGER = debug("test");
const SERVER = new TestServer("127.0.0.1");
const S7_ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
    reconnectTimeMS: 300,
});
S7_ENDP.connect();

let mqtt: Client;
function simIncMessage(msg: Message) {
    (mqtt as any).onMessageCallback(
        msg.topic.join("/"),
        Buffer.from(msg.body, "utf-8"),
        { qos: msg.qos, retain: msg.retain },
    );
}
let publishMock: jest.Mock;

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
                      "hex",
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

beforeEach(async () => {
    if (!S7_ENDP.connected) {
        //S7_ENDP.connect();
        await once(S7_ENDP, "connect");
    }

    mqtt = new Client({
        url: "localhost",
        clientId: "client01",
    });
    publishMock = jest.fn((msg: Message) => {
        return Promise.resolve();
    });
    (mqtt as any).publishMessage = publishMock;
    jest.clearAllMocks();
});

describe("fire and forget commands", () => {
    it("should write the parameter on message", async () => {
        const CONFIG1: tS7CommandConfig = {
            name: "cmd01",
            params: ["DB1,DW0", "DB20,X2.2.3", "DB300,USInt4"],
        };
        SERVER.setArea(1, Buffer.alloc(4));
        SERVER.setArea(20, Buffer.alloc(3));
        SERVER.setArea(300, Buffer.alloc(5));
        const cmd = new S7Command(CONFIG1, S7_ENDP, mqtt, DEBUGGER);
        const m1 = new Message(
            "cmd/client01/me/other",
            2,
            false,
            "[100, 1, [1, 2, 1], 3]",
        ); //wrong topic
        const m2 = new Message(
            "cmd/client01/me/cmd01",
            2,
            false,
            "[101, 1, [1, 2, 1]]",
        ); //wrong param count
        const m3 = new Message(
            "cmd/client01/me/cmd01",
            2,
            false,
            "[102, 1, [1, 2, 1]], 'no number'",
        ); //wrong param type
        const m4 = new Message("cmd/client01/me/cmd01", 2, false, "Hello"); //completely wrong message
        const m5 = new Message(
            "cmd/client01/me/cmd01",
            2,
            false,
            "[99, 10, [2, 1, 2], 30]",
        );
        simIncMessage(m1);
        await promiseTimeout(150); //Throttle
        simIncMessage(m2);
        await promiseTimeout(150);
        simIncMessage(m3);
        await promiseTimeout(150);
        simIncMessage(m4);
        await promiseTimeout(150);
        simIncMessage(m5);
        await promiseTimeout(1000);
        expect(SERVER.getDbArea(1)).toBeBuffer("0000000a");
        expect(SERVER.getDbArea(20)).toBeBuffer("00001c");
        expect(SERVER.getDbArea(300)).toBeBuffer("000000001e");
        expect(publishMock).toBeCalledTimes(1);
        const msg = publishMock.mock.calls[0][0];
        expect(msg.topic.join("/")).toBe("cmdRes/me/client01/cmd01");
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(msg.body).toBe("[99,1]");
    });

    it("should write cmdId if specified", async () => {
        const CONFIG2: tS7CommandConfig = {
            name: "cmd02",
            cmdIdAddress: "DB1,W4",
            params: ["DB1,DW0", "DB20,X2.2.3", "DB300,USInt4"],
            //requiredParamCount: 2
        };
        SERVER.setArea(1, Buffer.alloc(6));
        SERVER.setArea(20, Buffer.alloc(3));
        SERVER.setArea(300, Buffer.alloc(5));
        const cmd = new S7Command(CONFIG2, S7_ENDP, mqtt, DEBUGGER);
        const m1 = new Message(
            "cmd/client01/me/cmd02",
            2,
            false,
            "[99, 10, [2, 1, 2], 30]",
        );
        simIncMessage(m1);
        await promiseTimeout(1000);
        expect(SERVER.getDbArea(1)).toBeBuffer("0000000a0063");
        expect(SERVER.getDbArea(20)).toBeBuffer("00001c");
        expect(SERVER.getDbArea(300)).toBeBuffer("000000001e");
        expect(publishMock).toBeCalledTimes(1);
        const msg = publishMock.mock.calls[0][0];
        expect(msg.topic.join("/")).toBe("cmdRes/me/client01/cmd02");
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(msg.body).toBe("[99,1]");
    });

    it("should write lower number of params if defined", async () => {
        const CONFIG3: tS7CommandConfig = {
            name: "cmd03",
            cmdIdAddress: "DB1,W4",
            params: ["DB1,DW0", "DB20,X2.2.3", "DB300,USInt4"],
            requiredParamCount: 2,
        };
        SERVER.setArea(1, Buffer.alloc(6));
        SERVER.setArea(20, Buffer.alloc(3));
        SERVER.setArea(300, Buffer.alloc(5));
        const cmd = new S7Command(CONFIG3, S7_ENDP, mqtt, DEBUGGER);
        const m1 = new Message(
            "cmd/client01/me/cmd03",
            2,
            false,
            "[99, 10, [2, 1, 2]]",
        );
        simIncMessage(m1);
        await promiseTimeout(1000);
        expect(SERVER.getDbArea(1)).toBeBuffer("0000000a0063");
        expect(SERVER.getDbArea(20)).toBeBuffer("00001c");
        expect(SERVER.getDbArea(300)).toBeBuffer("0000000000");
        expect(publishMock).toBeCalledTimes(1);
        const msg = publishMock.mock.calls[0][0];
        expect(msg.topic.join("/")).toBe("cmdRes/me/client01/cmd03");
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(msg.body).toBe("[99,1]");
    });

    it("should write max number of params when smaller is defined", async () => {
        const CONFIG31: tS7CommandConfig = {
            name: "cmd031",
            cmdIdAddress: "DB1,W4",
            params: ["DB1,DW0", "DB20,X2.2.3", "DB300,USInt4"],
            requiredParamCount: 2,
        };
        SERVER.setArea(1, Buffer.alloc(6));
        SERVER.setArea(20, Buffer.alloc(3));
        SERVER.setArea(300, Buffer.alloc(5));
        const cmd = new S7Command(CONFIG31, S7_ENDP, mqtt, DEBUGGER);
        const m1 = new Message(
            "cmd/client01/me/cmd031",
            2,
            false,
            "[99, 10, [2, 1, 2], 30]",
        );
        simIncMessage(m1);
        await promiseTimeout(1000);
        expect(SERVER.getDbArea(1)).toBeBuffer("0000000a0063");
        expect(SERVER.getDbArea(20)).toBeBuffer("00001c");
        expect(SERVER.getDbArea(300)).toBeBuffer("000000001e");
        expect(publishMock).toBeCalledTimes(1);
        const msg = publishMock.mock.calls[0][0];
        expect(msg.topic.join("/")).toBe("cmdRes/me/client01/cmd031");
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(msg.body).toBe("[99,1]");
    });

    it("should use different prefix", async () => {
        const CONFIG4: tS7CommandConfig = {
            name: "cmd04",
            topicPrefix: "task",
            cmdIdAddress: "DB1,W4",
            params: ["DB1,DW0", "DB20,X2.2.3", "DB300,USInt4"],
            requiredParamCount: 2,
        };
        SERVER.setArea(1, Buffer.alloc(6));
        SERVER.setArea(20, Buffer.alloc(3));
        SERVER.setArea(300, Buffer.alloc(5));
        const cmd = new S7Command(CONFIG4, S7_ENDP, mqtt, DEBUGGER);
        const m1 = new Message(
            "task/client01/me/cmd04",
            2,
            false,
            "[99, 10, [2, 1, 2]]",
        );
        simIncMessage(m1);
        await promiseTimeout(1000);
        expect(publishMock).toBeCalledTimes(1);
        const msg = publishMock.mock.calls[0][0];
        expect(msg.topic.join("/")).toBe("cmdRes/me/client01/cmd04");
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(msg.body).toBe("[99,1]");
    });

    it("should handle no parameter", async () => {
        const CONFIG41: tS7CommandConfig = {
            name: "cmd041",
            cmdIdAddress: "DB1,W4",
        };
        SERVER.setArea(1, Buffer.alloc(6));
        SERVER.setArea(20, Buffer.alloc(3));
        SERVER.setArea(300, Buffer.alloc(5));
        const cmd = new S7Command(CONFIG41, S7_ENDP, mqtt, DEBUGGER);
        const m1 = new Message(
            "cmd/client01/me/cmd041",
            2,
            false,
            "[99, 10, [2, 1, 2]]",
        );
        simIncMessage(m1);
        await promiseTimeout(1000);
        expect(SERVER.getDbArea(1)).toBeBuffer("000000000063");
        expect(publishMock).toBeCalledTimes(1);
        const msg = publishMock.mock.calls[0][0];
        expect(msg.topic.join("/")).toBe("cmdRes/me/client01/cmd041");
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(msg.body).toBe("[99,1]");
    });

    it("should handle error", async () => {
        const CONFIG5: tS7CommandConfig = {
            name: "cmd05",
            topicPrefix: "task",
            cmdIdAddress: "DB1,W4",
            params: ["DB1,DW0", "DB20,X2.2.3", "DB301,USInt4"], //DB301 does not exist
            requiredParamCount: 2,
        };
        SERVER.setArea(1, Buffer.alloc(6));
        SERVER.setArea(20, Buffer.alloc(3));
        SERVER.setArea(300, Buffer.alloc(5));
        const cmd = new S7Command(CONFIG5, S7_ENDP, mqtt, DEBUGGER);
        const m1 = new Message(
            "task/client01/me/cmd05",
            2,
            false,
            "[99, 10, [2, 1, 2], 30]",
        );
        simIncMessage(m1);
        await promiseTimeout(1000);
        expect(publishMock).toBeCalledTimes(1);
        const msg = publishMock.mock.calls[0][0];
        expect(msg.topic.join("/")).toBe("cmdRes/me/client01/cmd05");
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(msg.body).toBe("[99,0]");
    });
});

describe("commands with response tests", () => {
    it("should send response on trigger", async () => {
        const CONFIG12: tS7CommandConfig = {
            name: "cmd01",
            params: ["DB201,DW0", "DB2012,X2.2.3", "DB2013,USInt4"],
            requiredParamCount: 2,
            result: {
                trigger: "DB20101,W0",
                params: ["DB20102,DW0", "DB20103,X1.0.9", "DB20104,USInt2"],
                okFlagAddress: "DB20105,USInt2",
                pollIntervalMS: 500,
                //topicPrefix: "answer",
                timeoutMS: 2500,
            },
        };
        SERVER.setArea(201, Buffer.alloc(6));
        SERVER.setArea(2012, Buffer.alloc(3));
        SERVER.setArea(2013, Buffer.alloc(5));
        SERVER.setArea(20101, Buffer.alloc(2));
        SERVER.setArea(20102, Buffer.alloc(4));
        SERVER.setArea(20103, Buffer.alloc(3));
        SERVER.setArea(20104, Buffer.alloc(3));
        SERVER.setArea(20105, Buffer.alloc(3));
        const cmd = new S7Command(CONFIG12, S7_ENDP, mqtt, DEBUGGER);
        const m1 = new Message(
            "cmd/client01/me/cmd01",
            2,
            false,
            "[101, 10, [2, 1, 2], 30]",
        );
        simIncMessage(m1);
        await promiseTimeout(900);
        SERVER.setArea(20101, Buffer.from("0011", "hex")); //17 wrong trigger
        await promiseTimeout(900);
        SERVER.setArea(20102, Buffer.from("0000000a", "hex")); //10
        SERVER.setArea(20103, Buffer.from("AAAAAA", "hex"));
        SERVER.setArea(20104, Buffer.from("000010", "hex"));
        SERVER.setArea(20105, Buffer.from("0000FF", "hex"));
        SERVER.setArea(20101, Buffer.from("0065", "hex")); //101
        await promiseTimeout(900);
        expect(publishMock).toBeCalledTimes(1);
        const msg = publishMock.mock.calls[0][0];
        expect(msg.topic.join("/")).toBe("cmdRes/me/client01/cmd01");
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(msg.body).toBe("[101,255,10,[0,1,0,1,0,1,0,1,0],16]");
        (cmd as any)._s7event.stopPolling();
        await once((cmd as any)._s7event, "pollingStopped");
    });

    it("should send error on timeout", async () => {
        const CONFIG22: tS7CommandConfig = {
            name: "cmd02",
            params: ["DB202,DW0", "DB2022,X2.2.3", "DB2023,USInt4"],
            requiredParamCount: 2,
            result: {
                trigger: "DB20201,W0",
                params: ["DB20202,DW0", "DB20203,X1.0.9", "DB20204,USInt2"],
                okFlagAddress: "DB2025,USInt2",
                pollIntervalMS: 500,
                //topicPrefix: "answer",
                timeoutMS: 500,
            },
        };
        SERVER.setArea(202, Buffer.alloc(6));
        SERVER.setArea(2022, Buffer.alloc(3));
        SERVER.setArea(2023, Buffer.alloc(5));
        SERVER.setArea(20201, Buffer.alloc(2));
        SERVER.setArea(20202, Buffer.alloc(4));
        SERVER.setArea(20203, Buffer.alloc(3));
        SERVER.setArea(20204, Buffer.alloc(3));
        SERVER.setArea(20205, Buffer.alloc(3));
        const cmd = new S7Command(CONFIG22, S7_ENDP, mqtt, DEBUGGER);
        const m1 = new Message(
            "cmd/client01/me/cmd02",
            2,
            false,
            "[102, 10, [2, 1, 2], 30]",
        );
        simIncMessage(m1);
        await promiseTimeout(1100);
        SERVER.setArea(20202, Buffer.from("0000000a", "hex")); //10
        SERVER.setArea(20203, Buffer.from("AAAAAA", "hex"));
        SERVER.setArea(20204, Buffer.from("000010", "hex"));
        SERVER.setArea(20205, Buffer.from("0000FF", "hex"));
        SERVER.setArea(20201, Buffer.from("0066", "hex")); //102
        expect(publishMock).toBeCalledTimes(1);
        const msg = publishMock.mock.calls[0][0];
        expect(msg.topic.join("/")).toBe("cmdRes/me/client01/cmd02");
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(msg.body).toBe("[102,0]");
        (cmd as any)._s7event.stopPolling();
        await once((cmd as any)._s7event, "pollingStopped");
    });
});
