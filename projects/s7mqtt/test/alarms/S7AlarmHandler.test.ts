// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { once } from "events";
import { join } from "path";
import { tPresentAlarmsInfo } from "@woifes/alarmhandler";
import { Client } from "@woifes/mqtt-client";
import { S7RemoteEndpoint } from "@woifes/s7endpoint";
import { TestServer } from "@woifes/s7endpoint/test/TestServer";
import debug from "debug";
import {
    emptyDirSync,
    mkdirSync,
    readFileSync,
    rmdirSync,
    writeFileSync,
} from "fs-extra";
import { tS7AlarmHandlerConfig } from "projects/s7mqtt/src/alarms/S7AlarmHandlerConfig";
import { S7AlarmHandler } from "../../src/alarms/S7AlarmHandler";
import { TestAlarmSource } from "./TestAlarmSource";

async function promiseTimeout(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

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
function createConfig(name: string, alCount: number): tS7AlarmHandlerConfig {
    return {
        numOfAlarms: alCount,
        traceFilePath: traceFile(name),
        presentAlarmsFilePath: presFile(name),
        alarmDefsPath: defFile(name),
        alarms: [],
    };
}

const MQTT = new Client({
    url: "localhost",
    clientId: "client01",
});

const DEBUGGER = debug("test");

const publishValueSyncSpy = jest.spyOn(MQTT, "publishValueSync");
const publishedMessage = jest.spyOn(MQTT, "publishMessage");

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

let s7al: S7AlarmHandler;

beforeAll(async () => {
    try {
        emptyDirSync(TMP_DIR);
        rmdirSync(TMP_DIR);
        if (!S7ENDP.connected) {
            await once(S7ENDP, "connect");
        }
    } catch {
    } finally {
        mkdirSync(TMP_DIR);
    }
});

afterAll(async () => {
    SERVER.stop();
    emptyDirSync(TMP_DIR);
    rmdirSync(TMP_DIR);
});

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(async () => {
    await s7al.stopPolling();
});

describe("creation tests", () => {
    it("should create s7 alarm handler", async () => {
        const ta = new TestAlarmSource(7, 100, SERVER);
        const presentAlarms: tPresentAlarmsInfo = {
            time: "2022-01-30T14:19:12.638Z",
            alarms: {
                2: {
                    occurred: "2022-01-30T14:19:12.638Z",
                    ackTime: "2022-01-30T14:19:14.638Z",
                },
                3: {
                    occurred: "2022-01-30T14:19:12.638Z",
                    ackTime: "2022-01-30T14:19:14.638Z",
                },
            },
        };
        writeFileSync(
            presFile("test01"),
            JSON.stringify(presentAlarms),
            "utf-8",
        );
        ta.signalsDb = Buffer.from("00", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        ta.ackInDb = Buffer.from("FF", "hex");
        const config = createConfig("test01", 7);
        config.alarms = {
            signal: `DB${ta.signalDbNr},X0.0`,
            ackOut: `DB${ta.ackOutDbNr},X0.0`,
        };
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        await promiseTimeout(500);
        expect(ta.ackInDb.toString("hex")).toBe("ff");
    });

    it("should create s7 alarm handler and reset ackIns (alarm bulk)", async () => {
        const ta = new TestAlarmSource(7, 200, SERVER);
        const presentAlarms: tPresentAlarmsInfo = {
            time: "2022-01-30T14:19:12.638Z",
            alarms: {
                2: {
                    occurred: "2022-01-30T14:19:12.638Z",
                    ackTime: "2022-01-30T14:19:14.638Z",
                },
                3: {
                    occurred: "2022-01-30T14:19:12.638Z",
                    ackTime: "2022-01-30T14:19:14.638Z",
                },
            },
        };
        writeFileSync(
            presFile("test02"),
            JSON.stringify(presentAlarms),
            "utf-8",
        );
        ta.signalsDb = Buffer.from("00", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        ta.ackInDb = Buffer.from("F0", "hex");
        const config = createConfig("test02", 7);
        config.alarms = {
            signal: `DB${ta.signalDbNr},X0.0`,
            ackOut: `DB${ta.ackOutDbNr},X0.0`,
            ackIn: `DB${ta.ackInDbNr},X0.0`,
        };
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        await promiseTimeout(500);
        expect(ta.ackInDb.toString("hex")).toBe("86");
    });

    it("should create s7 alarm handler and reset ackIns (discrete alarms)", async () => {
        const ta = new TestAlarmSource(3, 300, SERVER);
        const presentAlarms: tPresentAlarmsInfo = {
            time: "2022-01-30T14:19:12.638Z",
            alarms: {
                2: {
                    occurred: "2022-01-30T14:19:12.638Z",
                    ackTime: "2022-01-30T14:19:14.638Z",
                },
                3: {
                    occurred: "2022-01-30T14:19:12.638Z",
                    ackTime: "2022-01-30T14:19:14.638Z",
                },
            },
        };
        writeFileSync(
            presFile("test02"),
            JSON.stringify(presentAlarms),
            "utf-8",
        );
        ta.signalsDb = Buffer.from("00", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        ta.ackInDb = Buffer.from("F0", "hex");
        const config = createConfig("test03", 3);
        config.alarms = [
            {
                signal: `DB${ta.signalDbNr},X0.1`,
                ackOut: `DB${ta.ackOutDbNr},X0.2`,
                ackIn: `DB${ta.ackInDbNr},X0.3`,
            },
            {
                signal: `DB${ta.signalDbNr},X0.3`,
                ackOut: `DB${ta.ackOutDbNr},X0.4`,
                ackIn: `DB${ta.ackInDbNr},X0.5`,
            },
            {
                signal: `DB${ta.signalDbNr},X0.5`,
                ackOut: `DB${ta.ackOutDbNr},X0.6`,
                ackIn: `DB${ta.ackInDbNr},X0.7`,
            },
        ];
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        await promiseTimeout(500);
        expect(ta.ackInDb.toString("hex")).toBe("50");
    });
});

describe("signaling test (alarm bulk)", () => {
    it("should trigger and ack single alarm from plc", async () => {
        const ta = new TestAlarmSource(7, 1000, SERVER);
        ta.signalsDb = Buffer.from("00", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        ta.ackInDb = Buffer.from("00", "hex");
        const config = createConfig("test11", 5);
        config.presentAlarmWatchdogS = 0.5;
        config.alarms = {
            signal: `DB${ta.signalDbNr},X0.0`,
            ackOut: `DB${ta.ackOutDbNr},X0.0`,
        };
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        await promiseTimeout(700);
        ta.signalsDb = Buffer.from("01", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        ta.signalsDb = Buffer.from("00", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        ta.ackOutDb = Buffer.from("01", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
    });

    it("should trigger and ack and set ackIn for single alarm from plc", async () => {
        const ta = new TestAlarmSource(7, 1100, SERVER);
        ta.signalsDb = Buffer.from("00", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        ta.ackInDb = Buffer.from("00", "hex");
        const config = createConfig("test12", 5);
        config.presentAlarmWatchdogS = 0.5;
        config.alarms = {
            signal: `DB${ta.signalDbNr},X0.0`,
            ackOut: `DB${ta.ackOutDbNr},X0.0`,
            ackIn: `DB${ta.ackInDbNr},X0.0`,
        };
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        await promiseTimeout(700);
        ta.signalsDb = Buffer.from("01", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        ta.ackOutDb = Buffer.from("01", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(true);
        await promiseTimeout(700);
        expect(ta.ackInDb.toString("hex")).toBe("01");
        ta.signalsDb = Buffer.from("00", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        expect(ta.ackInDb.toString("hex")).toBe("00");
    });

    it("should set ackIn when ack from other sources", async () => {
        const ta = new TestAlarmSource(7, 1200, SERVER);
        ta.signalsDb = Buffer.from("00", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        ta.ackInDb = Buffer.from("00", "hex");
        const config = createConfig("test13", 5);
        config.presentAlarmWatchdogS = 0.5;
        config.alarms = {
            signal: `DB${ta.signalDbNr},X0.0`,
            ackOut: `DB${ta.ackOutDbNr},X0.0`,
            ackIn: `DB${ta.ackInDbNr},X0.0`,
        };
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        await promiseTimeout(700);
        ta.signalsDb = Buffer.from("01", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        //ta.ackOutDb = Buffer.from("01", "hex");
        s7al.alarmHandlerMqtt[1].ack = true;
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(true);
        await promiseTimeout(700);
        expect(ta.ackInDb.toString("hex")).toBe("01");
        ta.signalsDb = Buffer.from("00", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        expect(ta.ackInDb.toString("hex")).toBe("00");
    });
});

describe("signaling test (discrete alarms)", () => {
    it("should trigger and ack single alarm from plc (with parameter)", async () => {
        const ta = new TestAlarmSource(7, 2000, SERVER);
        ta.signalsDb = Buffer.from("00", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        ta.ackInDb = Buffer.from("00", "hex");
        const p1DbNr = ta.dbNumberBase + 10;
        ta.setArea(10, Buffer.from("0000007BFF", "hex"));
        const p2DbNr = ta.dbNumberBase + 20;
        ta.setArea(20, Buffer.from("00AAFF", "hex"));
        const p3DbNr = ta.dbNumberBase + 30;
        ta.setArea(30, Buffer.from("000000001234", "hex")); //4660
        const config = createConfig("test31", 3);
        config.presentAlarmWatchdogS = 0.5;
        config.alarms = [
            {
                signal: `DB${ta.signalDbNr},X0.1`,
                ackOut: `DB${ta.ackOutDbNr},X0.0`,
                parameter: [
                    `DB${p1DbNr},B3`,
                    `DB${p2DbNr},X1.3.3`,
                    `DB${p3DbNr},W4`,
                ],
            },
            {
                signal: `DB${ta.signalDbNr},X0.3`,
                ackOut: `DB${ta.ackOutDbNr},X0.4`,
            },
            {
                signal: `DB${ta.signalDbNr},X0.5`,
                ackOut: `DB${ta.ackOutDbNr},X0.6`,
            },
        ];
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        s7al.alarmHandlerMqtt[1].text = "$1 $2 $3";
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        await promiseTimeout(700);
        ta.signalsDb = Buffer.from("02", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].text).toBe("123 1,0,1 4660"); //paramter check
        ta.signalsDb = Buffer.from("00", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        ta.ackOutDb = Buffer.from("01", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
    });

    it("should trigger with inverted signal", async () => {
        const ta = new TestAlarmSource(7, 2010, SERVER);
        ta.signalsDb = Buffer.from("FF", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        const config = createConfig("test311", 3);
        config.presentAlarmWatchdogS = 0.5;
        config.alarms = [
            {
                signal: `DB${ta.signalDbNr},X0.1`,
                ackOut: `DB${ta.ackOutDbNr},X0.0`,
                invertSignal: true,
            },
            {
                signal: `DB${ta.signalDbNr},X0.3`,
                ackOut: `DB${ta.ackOutDbNr},X0.4`,
                invertSignal: true,
            },
            {
                signal: `DB${ta.signalDbNr},X0.5`,
                ackOut: `DB${ta.ackOutDbNr},X0.6`,
                invertSignal: true,
            },
        ];
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        await promiseTimeout(700);
        ta.signalsDb = Buffer.from("FD", "hex"); //signal alarm 2
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[2].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[2].signal).toBe(false);
        expect(s7al.alarmHandlerMqtt[3].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[3].signal).toBe(false);
        ta.signalsDb = Buffer.from("FF", "hex"); //no signal alarm 2
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        ta.ackOutDb = Buffer.from("01", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
    });

    it("should trigger and ack and set ackIn for single alarm from plc", async () => {
        const ta = new TestAlarmSource(7, 2100, SERVER);
        ta.signalsDb = Buffer.from("00", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        ta.ackInDb = Buffer.from("00", "hex");
        const p1DbNr = ta.dbNumberBase + 10;
        ta.setArea(10, Buffer.from("0000007BFF", "hex"));
        const p2DbNr = ta.dbNumberBase + 20;
        ta.setArea(20, Buffer.from("00AAFF", "hex"));
        const p3DbNr = ta.dbNumberBase + 30;
        ta.setArea(30, Buffer.from("000000001234", "hex")); //4660
        const config = createConfig("test32", 3);
        config.presentAlarmWatchdogS = 0.5;
        config.alarms = [
            {
                signal: `DB${ta.signalDbNr},X0.1`,
                ackOut: `DB${ta.ackOutDbNr},X0.0`,
                ackIn: `DB${ta.ackInDbNr},X0.3`,
                parameter: [
                    `DB${p1DbNr},B3`,
                    `DB${p2DbNr},X1.3.3`,
                    `DB${p3DbNr},W4`,
                ],
            },
            {
                signal: `DB${ta.signalDbNr},X0.3`,
                ackOut: `DB${ta.ackOutDbNr},X0.4`,
                ackIn: `DB${ta.ackInDbNr},X0.4`,
            },
            {
                signal: `DB${ta.signalDbNr},X0.5`,
                ackOut: `DB${ta.ackOutDbNr},X0.6`,
                ackIn: `DB${ta.ackInDbNr},X0.5`,
            },
        ];
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        s7al.alarmHandlerMqtt[1].text = "$1 $2 $3";
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        await promiseTimeout(700);
        ta.signalsDb = Buffer.from("02", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].text).toBe("123 1,0,1 4660"); //paramter check
        ta.ackOutDb = Buffer.from("01", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(true);
        await promiseTimeout(700);
        expect(ta.ackInDb.toString("hex")).toBe("08");
        ta.signalsDb = Buffer.from("00", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        expect(ta.ackInDb.toString("hex")).toBe("00");
    });

    it("should set ackIn when ack from other sources", async () => {
        const ta = new TestAlarmSource(7, 2200, SERVER);
        ta.signalsDb = Buffer.from("00", "hex");
        ta.ackOutDb = Buffer.from("00", "hex");
        ta.ackInDb = Buffer.from("00", "hex");
        const p1DbNr = ta.dbNumberBase + 10;
        ta.setArea(10, Buffer.from("0000007BFF", "hex"));
        const p2DbNr = ta.dbNumberBase + 20;
        ta.setArea(20, Buffer.from("00AAFF", "hex"));
        const p3DbNr = ta.dbNumberBase + 30;
        ta.setArea(30, Buffer.from("000000001234", "hex")); //4660
        const config = createConfig("test33", 3);
        config.presentAlarmWatchdogS = 0.5;
        config.alarms = [
            {
                signal: `DB${ta.signalDbNr},X0.1`,
                ackOut: `DB${ta.ackOutDbNr},X0.0`,
                ackIn: `DB${ta.ackInDbNr},X0.3`,
                parameter: [
                    `DB${p1DbNr},B3`,
                    `DB${p2DbNr},X1.3.3`,
                    `DB${p3DbNr},W4`,
                ],
            },
            {
                signal: `DB${ta.signalDbNr},X0.3`,
                ackOut: `DB${ta.ackOutDbNr},X0.4`,
                ackIn: `DB${ta.ackInDbNr},X0.4`,
            },
            {
                signal: `DB${ta.signalDbNr},X0.5`,
                ackOut: `DB${ta.ackOutDbNr},X0.6`,
                ackIn: `DB${ta.ackInDbNr},X0.5`,
            },
        ];
        s7al = new S7AlarmHandler(config, S7ENDP, MQTT, DEBUGGER);
        s7al.alarmHandlerMqtt[1].text = "$1 $2 $3";
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        await promiseTimeout(700);
        ta.signalsDb = Buffer.from("02", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].text).toBe("123 1,0,1 4660"); //parameter check
        ta.ackOutDb = Buffer.from("01", "hex");
        s7al.alarmHandlerMqtt[1].ack = true; //ack from extern
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(true);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(true);
        await promiseTimeout(700);
        expect(ta.ackInDb.toString("hex")).toBe("08");
        ta.signalsDb = Buffer.from("00", "hex");
        await promiseTimeout(700);
        expect(s7al.alarmHandlerMqtt[1].triggered).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].signal).toBe(false);
        expect(s7al.alarmHandlerMqtt[1].ack).toBe(false);
        expect(ta.ackInDb.toString("hex")).toBe("00");
    });
});
