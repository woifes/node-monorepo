// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TestServer } from "@woifes/s7endpoint/test/TestServer";
import { emptyDirSync, mkdirSync, readFileSync, rmdirSync } from "fs-extra";
import { join } from "path";
import { parse } from "yaml";
import { S7AlarmHandler } from "../src/alarms/S7AlarmHandler";
import { S7Command } from "../src/commands/S7Command";
import { S7EventMqtt } from "../src/events/S7EventMqtt";
import { MqttInput } from "../src/inputs/MqttInput";
import { S7OutputMqtt } from "../src/outputs/S7OutputMqtt";
import { S7Mqtt } from "../src/S7Mqtt";
import { LifeSign } from "../src/lifesign/LifeSign";
jest.mock("../src/alarms/S7AlarmHandler");
jest.mock("../src/lifeSign/LifeSign");
jest.mock("../src/commands/S7Command");
jest.mock("../src/events/S7EventMqtt");
jest.mock("../src/inputs/MqttInput");
jest.mock("../src/outputs/S7OutputMqtt");

async function wait(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const S7ALARM_HANDLER_MOCK = S7AlarmHandler as unknown as jest.Mock;
const LIFE_SIGN_MOCK = LifeSign as unknown as jest.Mock;
const S7COMMAND_MOCK = S7Command as unknown as jest.Mock;
const S7EVENT_MQTT_MOCK = S7EventMqtt as unknown as jest.Mock;
const MQTT_INPUT_MOCK = MqttInput as unknown as jest.Mock;
const S7OUTPUT_MQTT_MOCK = S7OutputMqtt as unknown as jest.Mock;

const alarmConfig = parse(
    readFileSync(
        join(__dirname, "..", "examples", "alarms", "alarm01.example.yaml"),
        "utf-8",
    ),
);
const alarmConfig2 = parse(
    readFileSync(
        join(__dirname, "..", "examples", "alarms", "alarm02.example.yaml"),
        "utf-8",
    ),
);
const lifesignConfig = parse(
    readFileSync(
        join(__dirname, "..", "examples", "lifesign", "lifesign.example.yaml"),
        "utf-8",
    ),
);
const commandConfig = parse(
    readFileSync(
        join(__dirname, "..", "examples", "commands", "command01.example.yaml"),
        "utf-8",
    ),
);
const commandConfig2 = parse(
    readFileSync(
        join(__dirname, "..", "examples", "commands", "command02.example.yaml"),
        "utf-8",
    ),
);
const eventConfig = parse(
    readFileSync(
        join(__dirname, "..", "examples", "events", "mqttevent.example.yaml"),
        "utf-8",
    ),
);
const eventConfig2 = parse(
    readFileSync(
        join(__dirname, "..", "examples", "events", "mqttevent02.example.yaml"),
        "utf-8",
    ),
);
const inputConfig = parse(
    readFileSync(
        join(__dirname, "..", "examples", "inputs", "mqttinput.example.yaml"),
        "utf-8",
    ),
);
const inputConfig2 = parse(
    readFileSync(
        join(__dirname, "..", "examples", "inputs", "mqttinput02.example.yaml"),
        "utf-8",
    ),
);
const outputConfig = parse(
    readFileSync(
        join(__dirname, "..", "examples", "outputs", "outputmqtt.example.yaml"),
        "utf-8",
    ),
);
const outputConfig2 = parse(
    readFileSync(
        join(
            __dirname,
            "..",
            "examples",
            "outputs",
            "outputmqtt02.example.yaml",
        ),
        "utf-8",
    ),
);

beforeEach(() => {
    jest.clearAllMocks();
});

describe("remote endpoint tests", () => {
    const baseConfig = {
        endpoint: {
            endpointIp: "localhost",
            rack: 1,
            slot: 2,
            selfRack: 3,
            selfSlot: 4,
            name: "name",
            reconnectTimeMS: 3000,
        },

        mqtt: {
            url: "localhost",
            clientId: "client01",
            notifyPresencePrefix: "clients",
            messageCacheTimeS: 3,
            caPath: "path/to/ca",
        },
    };

    const SERVER = new TestServer("127.0.0.1");
    afterAll(() => {
        SERVER.stop();
    });

    it("should create objects correctly", () => {
        const config = {
            ...baseConfig,
            alarms: alarmConfig,
            lifesign: lifesignConfig,
            commands: [
                { ...commandConfig },
                { ...commandConfig },
                { ...commandConfig },
            ],
            events: [
                { ...eventConfig },
                { ...eventConfig },
                { ...eventConfig },
            ],
            inputs: [
                { ...inputConfig },
                { ...inputConfig },
                { ...inputConfig },
            ],
            outputs: [
                { ...outputConfig },
                { ...outputConfig },
                { ...outputConfig },
            ],
        };
        const s7mqtt = new S7Mqtt(config);
        expect(S7ALARM_HANDLER_MOCK).toBeCalledTimes(1);
        expect(LIFE_SIGN_MOCK).toBeCalledTimes(1);
        expect(S7COMMAND_MOCK).toBeCalledTimes(3);
        expect(S7EVENT_MQTT_MOCK).toBeCalledTimes(3);
        expect(MQTT_INPUT_MOCK).toBeCalledTimes(3);
        expect(S7OUTPUT_MQTT_MOCK).toBeCalledTimes(3);
        expect((s7mqtt as any)._commands.length).toBe(3);
        expect((s7mqtt as any)._events.length).toBe(3);
        expect((s7mqtt as any)._inputs.length).toBe(3);
        expect((s7mqtt as any)._outputs.length).toBe(3);
    });
});

describe("local endpoint tests", () => {
    const TMP_DIR = join(__dirname, "tmp");
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
        try {
            emptyDirSync(TMP_DIR);
            rmdirSync(TMP_DIR);
        } catch {}
    });

    const baseConfig = {
        endpoint: {
            name: "local01",
            datablockCsvDir: TMP_DIR,
            allowArrayTypesInCsv: false,
        },

        mqtt: {
            url: "localhost",
            clientId: "client01",
            notifyPresencePrefix: "clients",
            messageCacheTimeS: 3,
            caPath: "path/to/ca",
        },
    };

    it("should create objects correctly", async () => {
        const config = {
            ...baseConfig,
            alarms: alarmConfig2,
            lifesign: lifesignConfig,
            commands: [{ ...commandConfig2 }],
            events: [{ ...eventConfig2 }],
            inputs: [{ ...inputConfig2 }],
            outputs: [{ ...outputConfig2 }],
        };
        const s7mqtt = new S7Mqtt(config);
        expect(S7ALARM_HANDLER_MOCK).toBeCalledTimes(1);
        expect(LIFE_SIGN_MOCK).toBeCalledTimes(1);
        expect(S7COMMAND_MOCK).toBeCalledTimes(1);
        expect(S7EVENT_MQTT_MOCK).toBeCalledTimes(1);
        expect(MQTT_INPUT_MOCK).toBeCalledTimes(1);
        expect(S7OUTPUT_MQTT_MOCK).toBeCalledTimes(1);
        expect((s7mqtt as any)._commands.length).toBe(1);
        expect((s7mqtt as any)._events.length).toBe(1);
        expect((s7mqtt as any)._inputs.length).toBe(1);
        expect((s7mqtt as any)._outputs.length).toBe(1);
        const dbFileContent = readFileSync(
            join(TMP_DIR, "local01_DBs.csv"),
            "utf-8",
        );
        expect(dbFileContent).toBe(`Name;Path;Connection;PLC tag;DataType;Length;Coding;Access Method;Address;Indirect addressing;Index tag;Start value;ID tag;Acquisition mode;Acquisition cycle;Limit Upper 2 Type;Limit Upper 2;Limit Lower 2 Type;Limit Lower 2;Linear scaling;End value PLC;Start value PLC;End value HMI;Start value HMI
alarm1_sig;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB1.DBX0.1;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Cmd_cmd01_cmdId;Standard-Variablentabelle;Con01;<No Value>;DWord;4;Binary;Absolute access;%DB1.DBD0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Cmd_cmd01_param1;Standard-Variablentabelle;Con01;<No Value>;DWord;4;Binary;Absolute access;%DB1.DBD0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Evt_1_trigger;Standard-Variablentabelle;Con01;<No Value>;Word;2;Binary;Absolute access;%DB1.DBW4;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
input_1_1;Standard-Variablentabelle;Con01;<No Value>;Byte;1;Binary;Absolute access;%DB1.DBB0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
tag01;Standard-Variablentabelle;Con01;<No Value>;Word;2;Binary;Absolute access;%DB1.DBW1;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
alarm1_ackOut;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB2.DBX0.2;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
input_1_2;Standard-Variablentabelle;Con01;<No Value>;Byte;1;Binary;Absolute access;%DB2.DBB0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
al1_p1;Standard-Variablentabelle;Con01;<No Value>;Word;2;Binary;Absolute access;%DB3.DBW10;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
alarm1_ackIn;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB3.DBX0.3;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Cmd_cmd01_param2;Standard-Variablentabelle;Con01;<No Value>;Byte;1;Binary;Absolute access;%DB3.DBB4;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
input_1_3;Standard-Variablentabelle;Con01;<No Value>;Byte;1;Binary;Absolute access;%DB3.DBB0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
alarm2_sig;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB4.DBX0.3;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Cmd_cmd01_resTrigger;Standard-Variablentabelle;Con01;<No Value>;Word;2;Binary;Absolute access;%DB4.DBW0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
alarm2_ackOut;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB5.DBX0.4;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Cmd_cmd01_resParam1;Standard-Variablentabelle;Con01;<No Value>;DWord;4;Binary;Absolute access;%DB5.DBD0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
alarm2_ackIn;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB6.DBX0.5;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
alarm3_sig;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB7.DBX0.5;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Cmd_cmd01_resParam2;Standard-Variablentabelle;Con01;<No Value>;SInt;1;Binary;Absolute access;%DB7.DBB2;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
alarm3_ackOut;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB8.DBX0.6;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Cmd_cmd01_okFlag;Standard-Variablentabelle;Con01;<No Value>;Byte;1;Binary;Absolute access;%DB8.DBB2;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
alarm3_ackIn;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB9.DBX0.7;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Evt_1_param1;Standard-Variablentabelle;Con01;<No Value>;DWord;4;Binary;Absolute access;%DB12.DBD0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
Evt_1_param2;Standard-Variablentabelle;Con01;<No Value>;SInt;1;Binary;Absolute access;%DB20.DBB2;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
`);
        const ep = (s7mqtt as any)._s7ep;
        expect(ep.getArea(1).length).toBe(6);
        expect(ep.getArea(2).length).toBe(1);
        expect(ep.getArea(3).length).toBe(12);
        expect(ep.getArea(4).length).toBe(2);
        expect(ep.getArea(5).length).toBe(4);
        expect(ep.getArea(6).length).toBe(1);
        expect(ep.getArea(7).length).toBe(3);
        expect(ep.getArea(8).length).toBe(3);
        expect(ep.getArea(9).length).toBe(1);
        expect(ep.getArea(12).length).toBe(4);
        expect(ep.getArea(20).length).toBe(3);
    });
});
