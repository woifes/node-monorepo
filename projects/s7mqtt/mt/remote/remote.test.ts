// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Message } from "@woifes/mqtt-client";
import { emptyDirSync, mkdirSync, rmdirSync } from "fs-extra";
import { join, resolve } from "path";
import { S7Mqtt } from "../../src/S7Mqtt";
import { CONFIG } from "./remoteConfig";

const TMP_DIR = join(__dirname, "tmp");
emptyDirSync(TMP_DIR);
rmdirSync(TMP_DIR);
mkdirSync(TMP_DIR);

CONFIG.alarms!.traceFilePath = resolve(join(TMP_DIR, "testTrace"));
CONFIG.alarms!.presentAlarmsFilePath = resolve(join(TMP_DIR, "presentAlarms"));
CONFIG.alarms!.alarmDefsPath = resolve(join(TMP_DIR, "alarmDefs"));

const SERVER = new S7Mqtt(CONFIG);

const PUBMSGMOCK = jest.fn((msg: Message) => {
    return Promise.resolve();
});
(SERVER as any)._mqtt.publishMessage = PUBMSGMOCK;
function simulateIncMsg(msg: Message) {
    (SERVER as any)._mqtt.onMessageCallback(
        msg.topic.join("/"),
        msg.body,
        msg.publishOpts,
    );
}
async function wait(ms: number) {
    return new Promise((resolve, reject) => {
        setInterval(resolve, ms);
    });
}
function findInPubMsgMock(topic: string): Message[] {
    const result: Message[] = [];
    for (const msgArr of PUBMSGMOCK.mock.calls) {
        if (msgArr.length > 0 && msgArr[0].topic.join("/") === topic) {
            result.push(msgArr[0]);
        }
    }
    return result;
}

beforeEach(() => {
    jest.clearAllMocks();
});

afterAll(async () => {
    SERVER.stop();
    await wait(300);
    emptyDirSync(TMP_DIR);
    rmdirSync(TMP_DIR);
});

describe("command test", () => {
    it("should add two integer", async () => {
        const cmdId = Math.floor(Math.random() * 1000);
        await wait(500);
        const m = new Message(
            "actions/client01/me/add",
            2,
            false,
            `[${cmdId}, 100, 20, 3]`,
        );
        simulateIncMsg(m);
        await wait(3000);
        const m1 = findInPubMsgMock("results/me/client01/add")[0];
        expect(m1.body).toBe(`[${cmdId},1,123]`);
    });
});

describe("event test", () => {
    it("should trigger event", async () => {
        const cmdId = Math.floor(Math.random() * 1000);
        await wait(500);
        const m = new Message(
            "cmd/client01/me/triggerEvent",
            2,
            false,
            `[${cmdId}]`,
        );
        simulateIncMsg(m);
        await wait(1000);
        let m1 = findInPubMsgMock("cmdRes/me/client01/triggerEvent")[0];
        expect(m1.body).toBe(`[${cmdId},1]`);
        m1 = findInPubMsgMock("a/b/c")[0];
        expect(m1.body).toBe(
            `[${cmdId + 1},${cmdId + 10},${cmdId + 100},${cmdId + 1000}]`,
        );
    });
});

describe("input test", () => {
    it("should set input", async () => {
        const val = Math.floor(Math.random() * 100);
        await wait(500);
        const m = new Message(
            "inputs/first",
            2,
            false,
            `[${val},${val + 1},${val + 2}]`,
        );
        simulateIncMsg(m);
        await wait(500);
        const readReq = (SERVER as any)._s7ep.createReadRequest([
            { name: "1", area: "DB", dbNr: 3001, byteIndex: 0, type: "UINT8" },
            { name: "2", area: "DB", dbNr: 3001, byteIndex: 1, type: "UINT8" },
            { name: "3", area: "DB", dbNr: 3001, byteIndex: 2, type: "UINT8" },
        ]);
        const result = await readReq.execute();
        expect(result[0].value).toBe(val);
        expect(result[1].value).toBe(val + 1);
        expect(result[2].value).toBe(val + 2);
    });
});

describe("output test", () => {
    it("should emit output cyclically", async () => {
        const cmdId = Math.floor(Math.random() * 1000);
        await wait(500);
        const m = new Message(
            "cmd/client01/me/setOutputs",
            2,
            false,
            `[${cmdId}]`,
        );
        simulateIncMsg(m);
        await wait(3500);
        const out1 = findInPubMsgMock("plc01/tag01").at(-1);
        expect(out1!.body).toBe(`${cmdId + 1}`);
        const out2 = findInPubMsgMock("plc01/tag02").at(-1);
        expect(out2!.body).toBe(`${cmdId + 10}`);
        const out3 = findInPubMsgMock("plc01/tag03").at(-1);
        expect(out3!.body).toBe(`${cmdId + 100}`);
    });
});

describe("alarm test", () => {
    jest.setTimeout(7000);

    async function sendSetSignal(value: boolean) {
        const cmdId = Math.floor(Math.random() * 1000);
        await wait(500);
        const m = new Message(
            "cmd/client01/me/setSignal",
            2,
            false,
            `[${cmdId}, ${value ? 1 : 0}]`,
        );
        simulateIncMsg(m);
    }
    async function sendSetAck(value: boolean) {
        const cmdId = Math.floor(Math.random() * 1000);
        await wait(500);
        const m = new Message(
            "cmd/client01/me/setAck",
            2,
            false,
            `[${cmdId}, ${value ? 1 : 0}]`,
        );
        simulateIncMsg(m);
    }

    it("should trigger and ack alarm from plc", async () => {
        await sendSetSignal(true);
        await wait(2200);
        expect((SERVER as any)._alarms._alarmHandlerMqtt[2].triggered).toBe(
            true,
        );
        await sendSetAck(true);
        await wait(2200);
        expect((SERVER as any)._alarms._alarmHandlerMqtt[2].triggered).toBe(
            false,
        );
    });

    it("should trigger and ack alarm from mqtt", async () => {
        await sendSetSignal(true);
        await wait(2200);
        expect((SERVER as any)._alarms._alarmHandlerMqtt[2].triggered).toBe(
            true,
        );

        const m = new Message("alarms/ack/client01", 2, false, "2");
        simulateIncMsg(m);

        await wait(2200);
        expect((SERVER as any)._alarms._alarmHandlerMqtt[2].triggered).toBe(
            false,
        );
    });
});
