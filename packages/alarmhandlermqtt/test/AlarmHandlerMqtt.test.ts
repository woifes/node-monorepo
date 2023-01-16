// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client, Message } from "@woifes/mqtt-client";
import { emptyDirSync, mkdirSync, readFileSync, rmdirSync } from "fs-extra";
import { join } from "path";
import { AlarmHandlerMqtt } from "../src/AlarmHandlerMqtt";
import { tAlarmHandlerMqttConfig } from "../src/runtypes/AlarmHandlerMqttConfig";

/* eslint-disable no-empty */

async function promiseTimeout(ms: number): Promise<void> {
    return new Promise((resolve, reject) => {
        jest.useRealTimers();
        setTimeout(() => {
            jest.useFakeTimers();
            resolve();
        }, ms);
    });
}

let mqtt = new Client({
    clientId: "test01",
    url: "123",
});

let publishValueSyncMock = jest.fn(
    (
        topic: string,
        value: any,
        type: string,
        QoS: number,
        retain: boolean
    ) => {}
);
(mqtt as any).publishValueSync = publishValueSyncMock;
let publishMessageMock = jest.fn((msg: Message) => {
    return Promise.resolve();
});
(mqtt as any).publishMessage = publishMessageMock;

const TMP_DIR = join(__dirname, "tmp");
function fileInTemp(fileName: string): string {
    return join(TMP_DIR, fileName);
}
function traceFile(name: string) {
    return fileInTemp(`${name}.trace`);
}
function getTraceFile(name: string) {
    return readFileSync(traceFile(name), { encoding: "utf-8" });
}
function presFile(name: string) {
    return fileInTemp(`${name}.pers`);
}
function getPresFileObj(name: string) {
    return JSON.parse(readFileSync(presFile(name), { encoding: "utf-8" }));
}
function defFile(name: string) {
    return fileInTemp(`${name}.def`);
}
function getDefFileObj(name: string) {
    return JSON.parse(readFileSync(defFile(name), { encoding: "utf-8" }));
}
function createConfig(name: string, alCount: number): tAlarmHandlerMqttConfig {
    return {
        numOfAlarms: alCount,
        traceFilePath: traceFile(name),
        presentAlarmsFilePath: presFile(name),
        alarmDefsPath: defFile(name),
        additionalNewAlarmTopics: ["messenger/to/lara", "messenger/to/john"],
        textCommand: {
            commandTopicPrefix: "messenger/from",
            commandResponseTopicPrefix: "messenger/to",
        },
    };
}

beforeAll(() => {
    try {
        emptyDirSync(TMP_DIR);
        rmdirSync(TMP_DIR);
    } catch {
    } finally {
        mkdirSync(TMP_DIR);
    }
});

afterAll(() => {
    emptyDirSync(TMP_DIR);
    rmdirSync(TMP_DIR);
});

beforeEach(() => {
    jest.clearAllMocks();
    mqtt = new Client({
        clientId: "test01",
        url: "123",
    });

    publishValueSyncMock = jest.fn(
        (
            topic: string,
            value: any,
            type: string,
            QoS: number,
            retain: boolean
        ) => {}
    );
    (mqtt as any).publishValueSync = publishValueSyncMock;
    publishMessageMock = jest.fn((msg: Message) => {
        return Promise.resolve();
    });
    (mqtt as any).publishMessage = publishMessageMock;
});

describe("creation test", () => {
    it("should create without predefined PersistantAlarmDefs", () => {
        jest.useFakeTimers();
        const d1 = new Date(2020, 11, 24, 7, 10, 123);
        jest.setSystemTime(d1);
        const CONFIG = createConfig(mqtt.clientId, 10);
        const h = new AlarmHandlerMqtt(CONFIG, mqtt);
        const internalDefs = (h as any)._alarmDefs.getValue();
        const internalPres = (h as any)._presentAlarms.getValue();
        const defObj = getDefFileObj(mqtt.clientId);
        const presObj = getPresFileObj(mqtt.clientId);
        const traceFileContent = getTraceFile(mqtt.clientId);

        expect(internalDefs).toEqual(defObj);
        expect(defObj).toEqual({
            1: { autoAck: false, c: "default", cn: 0, text: "No text" },
            2: { autoAck: false, c: "default", cn: 0, text: "No text" },
            3: { autoAck: false, c: "default", cn: 0, text: "No text" },
            4: { autoAck: false, c: "default", cn: 0, text: "No text" },
            5: { autoAck: false, c: "default", cn: 0, text: "No text" },
            6: { autoAck: false, c: "default", cn: 0, text: "No text" },
            7: { autoAck: false, c: "default", cn: 0, text: "No text" },
            8: { autoAck: false, c: "default", cn: 0, text: "No text" },
            9: { autoAck: false, c: "default", cn: 0, text: "No text" },
            10: { autoAck: false, c: "default", cn: 0, text: "No text" },
        });
        expect(internalPres).toEqual(presObj);
        expect(presObj).toEqual({
            time: "2020-12-24T06:12:03.000Z",
            alarms: {},
        });
        expect(traceFileContent).toBe(
            "alarmNum;occurred;disappeared;acknowledged;autoAck;category;categoryNum;text\n"
        );

        expect(h.name).toBe(mqtt.clientId);
        expect(h.numOfAlarms).toBe(CONFIG.numOfAlarms);
        expect(h[1].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[2].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[3].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[4].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[5].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[6].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[7].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[8].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[9].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[10].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });

        (h as any).mqttConnect(true);
        expect(publishValueSyncMock).toBeCalledTimes(1);
        const [topic, value, type, QoS, retain] =
            publishValueSyncMock.mock.calls[0];
        expect(topic).toBe(`alarms/sources/${mqtt.clientId}/numberOfAlarms`);
        expect(value).toBe(10);
        expect(type).toBe("UINT32");
        expect(QoS).toBe(1);
        expect(retain).toBe(true);
    });
});

describe("Alarm signal tests", () => {
    const d1 = new Date(2020, 11, 24, 7, 10, 123);
    let h: AlarmHandlerMqtt;
    let prefixNr = 100;

    beforeEach(() => {
        const NAME = `alSig_${prefixNr++}`;
        const CONFIG = createConfig(NAME, 3);
        jest.useFakeTimers();
        jest.setSystemTime(d1);
        jest.clearAllMocks();
        h = new AlarmHandlerMqtt(CONFIG, mqtt);
    });

    it("should emit new event and return true for set signal", () => {
        h[2].text = "$1 $2 $3";
        expect(h.updateSignal(1, false)).toBe(true);
        expect(h.updateSignal(2, true, "A", 10, 30)).toBe(true);
        expect(h.updateSignal(3, false)).toBe(true);

        expect(publishValueSyncMock).toBeCalledTimes(3);
        let [topic, value, type, QoS, retain] =
            publishValueSyncMock.mock.calls[0];
        expect(topic).toBe(`alarms/new/${mqtt.clientId}`);
        expect(value).toEqual({
            category: "default",
            categoryNum: 0,
            occurred: d1.toJSON(),
            text: "A 10 30",
        });
        expect(type).toBe("JSON");
        expect(QoS).toBe(1);
        expect(retain).toBe(true);

        [topic, value, type, QoS, retain] = publishValueSyncMock.mock.calls[1];
        expect(topic).toBe(`messenger/to/lara`);
        expect(value).toEqual("New Alarm from test01: #2 - A 10 30");
        expect(type).toBe("STRING");
        expect(QoS).toBe(1);
        expect(retain).toBe(true);

        [topic, value, type, QoS, retain] = publishValueSyncMock.mock.calls[2];
        expect(topic).toBe(`messenger/to/john`);
        expect(value).toEqual("New Alarm from test01: #2 - A 10 30");
        expect(type).toBe("STRING");
        expect(QoS).toBe(1);
        expect(retain).toBe(true);

        jest.runOnlyPendingTimers();

        expect(publishMessageMock).toBeCalledTimes(3);
        let msg = publishMessageMock.mock.calls[0][0];
        expect(msg.topic).toEqual(["alarms", "present", mqtt.clientId]);
        expect(msg.qos).toBe(1);
        expect(msg.retain).toBe(true);
        expect(JSON.parse(msg.body)).toEqual({
            time: d1.toJSON(),
            watchdogError: true,
            alarms: {
                2: {
                    category: "default",
                    categoryNum: 0,
                    occurred: d1.toJSON(),
                    text: "A 10 30",
                },
            },
        });
        msg = publishMessageMock.mock.calls[1][0];
        expect(msg.topic).toEqual(["alarms", "present", mqtt.clientId]);
        expect(msg.qos).toBe(1);
        expect(msg.retain).toBe(true);
        expect(JSON.parse(msg.body)).toEqual({
            time: d1.toJSON(),
            watchdogError: false,
            alarms: {
                2: {
                    category: "default",
                    categoryNum: 0,
                    occurred: d1.toJSON(),
                    text: "A 10 30",
                },
            },
        });
        msg = publishMessageMock.mock.calls[2][0];
        expect(msg.topic).toEqual(["alarms", "present", mqtt.clientId]);
        expect(msg.qos).toBe(1);
        expect(msg.retain).toBe(true);
        expect(JSON.parse(msg.body)).toEqual({
            time: new Date(d1.getTime() + 3000).toJSON(),
            watchdogError: true,
            alarms: {
                2: {
                    category: "default",
                    categoryNum: 0,
                    occurred: d1.toJSON(),
                    text: "A 10 30",
                },
            },
        });
    });
});

describe("incoming message tests", () => {
    const d1 = new Date(2020, 11, 24, 7, 10, 123);
    let h: AlarmHandlerMqtt;
    let prefixNr = 200;

    beforeEach(() => {
        const NAME = `alSig_${prefixNr++}`;
        const CONFIG = createConfig(NAME, 3);
        jest.useFakeTimers();
        jest.setSystemTime(d1);
        jest.clearAllMocks();
        h = new AlarmHandlerMqtt(CONFIG, mqtt);
    });

    function simulateMessage(msg: Message) {
        (mqtt as any).onMessageCallback(
            msg.topic.join("/"),
            Buffer.from(msg.body),
            {
                qos: msg.qos,
                retain: msg.retain,
            }
        );
    }

    it("should acknowledge on ack message", () => {
        h[2].text = "Text with params: $1 $2";
        h.updateSignal(2, true, "A", 2);
        expect(h[1].ack).toBe(false);
        expect(h[2].ack).toBe(false);
        expect(h[3].ack).toBe(false);
        let m1 = new Message(`alarms/ack/${mqtt.clientId}`, 2, false, "2");
        let m2 = new Message(`alarms/ack/${mqtt.clientId}`, 2, false, "1");
        simulateMessage(m1);
        simulateMessage(m2);
        expect(h[2].triggered).toBe(true);
        expect(h[1].ack).toBe(false);
        expect(h[2].ack).toBe(true);
        expect(h[3].ack).toBe(false);

        h.updateSignal(2, false); //first ack directly the alarm

        h.updateSignal(2, true);
        h.updateSignal(3, true);
        expect(h[1].ack).toBe(false);
        expect(h[2].ack).toBe(false);
        expect(h[3].ack).toBe(false);
        m1 = new Message(`alarms/ack/${mqtt.clientId}`, 2, false, "0");
        simulateMessage(m1);
        expect(h[1].ack).toBe(false);
        expect(h[2].ack).toBe(true);
        expect(h[3].ack).toBe(true);

        h.updateSignal(2, false); // second ack with ack all
        h.updateSignal(3, false);

        h.updateSignal(2, true);
        h.updateSignal(3, true);
        expect(h[1].ack).toBe(false);
        expect(h[2].ack).toBe(false);
        expect(h[3].ack).toBe(false);
        m1 = new Message(`alarms/ack/${mqtt.clientId}`, 2, false, "-1");
        m2 = new Message(`alarms/ack/${mqtt.clientId}`, 2, false, "No number");
        simulateMessage(m1);
        simulateMessage(m2);
        expect(h[1].ack).toBe(false);
        expect(h[2].ack).toBe(false);
        expect(h[3].ack).toBe(false);
    });

    it("should set alarm text on cmd message", async () => {
        jest.useRealTimers();
        expect(h[1].text).toBe("No text");
        expect(h[2].text).toBe("No text");
        expect(h[3].text).toBe("No text");
        const m1 = new Message(
            `cmd/${mqtt.clientId}/me/setAlarmText`,
            2,
            false,
            JSON.stringify([123, 2, "New text 1"])
        );
        const m2 = new Message(
            `cmd/wrongClientId/me/setAlarmText`,
            2,
            false,
            JSON.stringify([123, 3, "New text 2"])
        ); //wrong client id
        const m3 = new Message(
            `cmd/wrongClientId/me/setAlarmText`,
            2,
            false,
            JSON.stringify([123, 7, "New text 3"])
        ); //wrong alarm number
        simulateMessage(m1);
        simulateMessage(m2);
        simulateMessage(m3);
        await promiseTimeout(100);
        expect(h[1].text).toBe("No text");
        expect(h[2].text).toBe("New text 1");
        expect(h[3].text).toBe("No text");

        expect(publishMessageMock).toBeCalledTimes(1);
        const msg = publishMessageMock.mock.calls[0][0];
        expect(msg.topic).toEqual([
            "cmdRes",
            "me",
            mqtt.clientId,
            "setAlarmText",
        ]);
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(JSON.parse(msg.body)).toEqual([123, 1]);
    });

    it("should get alarm history on cmd message", async () => {
        h[2].autoAck = true;
        let unixTime = new Date(2020, 11, 24, 7).getTime();
        jest.setSystemTime(unixTime);
        for (let i = 0; i < 100; i++) {
            h.updateSignal(2, i % 2 == 0);
            unixTime += 60 * 1000; //1 minute
            jest.setSystemTime(unixTime);
        }
        await promiseTimeout(500);
        const d1 = new Date(2020, 11, 24, 8, 5).getTime();
        const d2 = new Date(2020, 11, 24, 8, 30).getTime();
        const m1 = new Message(
            `cmd/${mqtt.clientId}/me/getHistory`,
            2,
            false,
            JSON.stringify([456, d1, d2])
        );
        jest.clearAllMocks();
        simulateMessage(m1);
        await promiseTimeout(100);
        expect(publishMessageMock).toBeCalledTimes(1);
        const msg = publishMessageMock.mock.calls[0][0];
        expect(msg.topic).toEqual([
            "cmdRes",
            "me",
            mqtt.clientId,
            "getHistory",
        ]);
        expect(msg.qos).toBe(2);
        expect(msg.retain).toBe(false);
        expect(JSON.parse(msg.body)).toEqual([
            456,
            1,
            [
                "2;2020-12-24T07:06:00.000Z;2020-12-24T07:07:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:08:00.000Z;2020-12-24T07:09:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:10:00.000Z;2020-12-24T07:11:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:12:00.000Z;2020-12-24T07:13:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:14:00.000Z;2020-12-24T07:15:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:16:00.000Z;2020-12-24T07:17:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:18:00.000Z;2020-12-24T07:19:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:20:00.000Z;2020-12-24T07:21:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:22:00.000Z;2020-12-24T07:23:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:24:00.000Z;2020-12-24T07:25:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:26:00.000Z;2020-12-24T07:27:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:28:00.000Z;2020-12-24T07:29:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:30:00.000Z;2020-12-24T07:31:00.000Z;;1;default;0;No text",
            ],
        ]);
    });

    it("should get alarm history to end", async () => {
        h[2].autoAck = true;
        let unixTime = new Date(2020, 11, 24, 7).getTime();
        jest.setSystemTime(unixTime);
        for (let i = 0; i < 100; i++) {
            h.updateSignal(2, i % 2 == 0);
            unixTime += 60 * 1000; //1 minute
            jest.setSystemTime(unixTime);
        }
        await promiseTimeout(500);
        const d1 = new Date(2020, 11, 24, 8, 30).getTime();
        const d2 = new Date(2020, 11, 25, 8, 30).getTime();
        const m1 = new Message(
            `cmd/${mqtt.clientId}/me/getHistory`,
            2,
            false,
            JSON.stringify([456, d1, d2])
        );
        jest.clearAllMocks();
        simulateMessage(m1);
        await promiseTimeout(200);
        expect(publishMessageMock).toBeCalledTimes(1);
        const msg = publishMessageMock.mock.calls[0][0];
        expect(JSON.parse(msg.body)).toEqual([
            456,
            1,
            [
                "2;2020-12-24T07:30:00.000Z;2020-12-24T07:31:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:32:00.000Z;2020-12-24T07:33:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:34:00.000Z;2020-12-24T07:35:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:36:00.000Z;2020-12-24T07:37:00.000Z;;1;default;0;No text",
                "2;2020-12-24T07:38:00.000Z;2020-12-24T07:39:00.000Z;;1;default;0;No text",
            ],
        ]);
    });
});

describe("text command tests", () => {
    const d1 = new Date(2020, 11, 24, 7, 10, 123);
    let h: AlarmHandlerMqtt;
    let prefixNr = 300;

    beforeEach(() => {
        const NAME = `alSig_${prefixNr++}`;
        const CONFIG = createConfig(NAME, 3);
        jest.useFakeTimers();
        jest.setSystemTime(d1);
        jest.clearAllMocks();
        h = new AlarmHandlerMqtt(CONFIG, mqtt);
    });

    function simTxtCmd(cmd: string) {
        (mqtt as any).onMessageCallback(`messenger/from/me`, Buffer.from(cmd), {
            qos: 2,
            retain: false,
        });
    }

    it("should display overall help", async () => {
        simTxtCmd("!al -h");
        await promiseTimeout(400);
        expect(publishMessageMock).toBeCalledTimes(1);
        let expected = "";
        expected += "Usage: !al [options] [command]\n";
        expected += "\n";
        expected += "Options:\n";
        expected +=
            "  -h, --help                          display help for command\n";
        expected += "\n";
        expected += "Commands:\n";
        expected +=
            "  who                                 Prints the alarm source and the number of their alarms\n";
        expected +=
            "  ack <alarmSourceName> [alarmNumber]  Acknowledges the given alarm. Acknowledges all if not given\n";
        expected +=
            "  act [alarmSourceName]               Prints the present alarms\n";
        expected +=
            "  help [command]                      display help for command\n";
        expect(
            publishMessageMock.mock.calls[0][0].body
                .replaceAll(" ", "")
                .replaceAll("\n", "")
        ).toBe(expected.replaceAll(" ", "").replaceAll("\n", ""));
    });

    describe("command 'who'", () => {
        it("should display own name and alarm number on 'who'", async () => {
            simTxtCmd("!al who");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(1);
            expect(publishMessageMock.mock.calls[0][0].body).toBe(
                "test01 with 3 Alarms"
            );
        });

        it("should display help of 'who'", async () => {
            simTxtCmd("!al help who");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(1);
            expect(publishMessageMock.mock.calls[0][0].body)
                .toBe(`Usage: !al who [options]

Prints the alarm source and the number of their alarms

Options:
  -h, --help  display help for command
`);
        });
    });

    describe("command 'ack'", () => {
        beforeEach(() => {
            h.updateSignal(2, true);
            h.updateSignal(2, false);
            jest.clearAllMocks();
        });

        it("should ack single alarm without nr param", async () => {
            simTxtCmd("!al ack test01");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(3);
            //console.log(publishMessageMock.mock.calls[0][0].body);
            //console.log(publishMessageMock.mock.calls[1][0].body);
            expect(publishMessageMock.mock.calls[2][0].body).toBe(
                "Alarm 0 was acknowledged"
            );
            expect(h[2].triggered).toBe(false);
        });

        it("should ack single alarm with nr param", async () => {
            simTxtCmd("!al ack test01 2");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(3);
            expect(publishMessageMock.mock.calls[2][0].body).toBe(
                "Alarm 2 was acknowledged"
            );
            expect(h[2].triggered).toBe(false);
        });

        it("should ack multiple alarms with 0 param", async () => {
            h.updateSignal(1, true);
            h.updateSignal(1, false);
            jest.clearAllMocks();
            simTxtCmd("!al ack test01 0");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(5);
            expect(publishMessageMock.mock.calls[4][0].body).toBe(
                "Alarm 0 was acknowledged"
            );
            expect(h[1].triggered).toBe(false);
            expect(h[2].triggered).toBe(false);
        });

        it("should display help on missing alarm handler param", async () => {
            simTxtCmd("!al ack");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(1);
            expect(publishMessageMock.mock.calls[0][0].body).toBe(
                "error: missing required argument 'alarmSourceName'\n"
            );
        });

        it("should display help on help command", async () => {
            simTxtCmd("!al help ack");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(1);
            expect(publishMessageMock.mock.calls[0][0].body)
                .toBe(`Usage: !al ack [options] <alarmSourceName> [alarmNumber]

Acknowledges the given alarm. Acknowledges all if not given

Arguments:
  alarmSourceName  which alarm source to ack
  alarmNumber      Which alarm number to acknowledge (default: 0)

Options:
  -h, --help       display help for command
`);
        });
    });

    describe("command 'act'", () => {
        beforeEach(() => {
            h.updateSignal(2, true);
            h.updateSignal(2, false);
            h.updateSignal(3, true);
            h.acknowledgeAlarm(3);
            jest.clearAllMocks();
        });

        it("should display act alarms", async () => {
            simTxtCmd("!al act");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(2);
            expect(publishMessageMock.mock.calls[1][0].body)
                .toBe(`Alarms of test01
______________________________
    2 | 24.12.2020 07:12:03.000
No text
______________________________
    3 | 24.12.2020 07:12:03.000
    ✔ 24.12.2020 07:12:03.000
No text
______________________________
`);
        });

        it("should display act alarms with name param", async () => {
            simTxtCmd("!al act test01");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(2);
            expect(publishMessageMock.mock.calls[1][0].body)
                .toBe(`Alarms of test01
______________________________
    2 | 24.12.2020 07:12:03.000
No text
______________________________
    3 | 24.12.2020 07:12:03.000
    ✔ 24.12.2020 07:12:03.000
No text
______________________________
`);
        });

        it("should display no alarms present message", async () => {
            h.updateSignal(3, false);
            h.acknowledgeAlarm(0);
            jest.clearAllMocks();
            simTxtCmd("!al act test01");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(2);
            expect(publishMessageMock.mock.calls[1][0].body).toBe(
                `No Alarms for test01`
            );
        });

        it("should display nothing when wrong name", async () => {
            simTxtCmd("!al act test02");
            await promiseTimeout(400);
            expect(publishMessageMock).not.toBeCalled();
        });

        it("should display help for act", async () => {
            simTxtCmd("!al help act");
            await promiseTimeout(400);
            expect(publishMessageMock).toBeCalledTimes(1);
            expect(publishMessageMock.mock.calls[0][0].body)
                .toBe(`Usage: !al act [options] [alarmSourceName]

Prints the present alarms

Arguments:
  alarmSourceName  Filter only for this alarm source

Options:
  -h, --help       display help for command
`);
        });
    });

    it("should display help on error", async () => {
        simTxtCmd("!al wrongcmd");
        await promiseTimeout(400);
        expect(publishMessageMock).toBeCalledTimes(1);
        expect(publishMessageMock.mock.calls[0][0].body).toBe(
            `error: unknown command 'wrongcmd'\n`
        );
    });

    it("should do nothing when wrong start command", async () => {
        simTxtCmd("Hello World");
        await promiseTimeout(400);
        expect(publishMessageMock).not.toBeCalled();
    });

    it("should do nothing when not configured", async () => {
        mqtt = new Client({
            clientId: "test01",
            url: "123",
        });

        publishValueSyncMock = jest.fn(
            (
                topic: string,
                value: any,
                type: string,
                QoS: number,
                retain: boolean
            ) => {}
        );
        (mqtt as any).publishValueSync = publishValueSyncMock;
        publishMessageMock = jest.fn((msg: Message) => {
            return Promise.resolve();
        });
        (mqtt as any).publishMessage = publishMessageMock;

        const name = `alSig_doNothing`;
        const config = createConfig(name, 3);
        delete config.textCommand;
        jest.clearAllMocks();
        const handler = new AlarmHandlerMqtt(config, mqtt);
        simTxtCmd("!al -h");
        await promiseTimeout(400);
        expect(publishMessageMock).not.toBeCalled();
    });
});
