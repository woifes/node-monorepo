// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { PersistentRuntype } from "@woifes/util";
import {
    emptyDirSync,
    mkdirSync,
    readFileSync,
    rmdirSync,
    writeFileSync,
} from "fs-extra";
import { join } from "path";
import { AlarmHandler } from "../src/AlarmHandler";
import { AlarmDefsInfo, tAlarmDefsInfo } from "../src/runtypes/AlarmDefsInfo";
import { tAlarmHandlerConfig } from "../src/runtypes/AlarmHandlerConfig";
import { tPresentAlarmsInfo } from "../src/runtypes/PresentAlarmsInfo";

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
function createConfig(name: string, alCount: number): tAlarmHandlerConfig {
    return {
        numOfAlarms: alCount,
        traceFilePath: traceFile(name),
        presentAlarmsFilePath: presFile(name),
        alarmDefsPath: defFile(name),
    };
}

beforeAll(() => {
    try {
        emptyDirSync(TMP_DIR);
        rmdirSync(TMP_DIR);
    } catch {
        //ignore
    } finally {
        mkdirSync(TMP_DIR);
    }
});

afterAll(() => {
    emptyDirSync(TMP_DIR);
    rmdirSync(TMP_DIR);
});

describe("creation test", () => {
    afterEach(() => {
        emptyDirSync(TMP_DIR);
    });

    it("should create AlarmHandler create Persistant Alarmdefs", () => {
        jest.useFakeTimers();
        const d1 = new Date(2020, 11, 24, 7, 10, 123);
        jest.setSystemTime(d1);
        const NAME = "al01";
        const CONFIG = createConfig(NAME, 10);
        const h = new AlarmHandler(NAME, CONFIG);
        const internalDefs = (h as any)._alarmDefs.getValue();
        const internalPres = (h as any)._presentAlarms.getValue();
        const defObj = getDefFileObj(NAME);
        const presObj = getPresFileObj(NAME);
        const traceFileContent = getTraceFile(NAME);

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

        expect(h.name).toBe(NAME);
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
    });

    it("should use persistant alarmdefs when given in constructor with lower number of alarms", () => {
        const NAME = "al02";
        const config = createConfig(NAME, 10);
        delete config.alarmDefsPath;
        const externalAlarmDefs: tAlarmDefsInfo = {
            1: { text: "bad thing01", autoAck: false, c: "cat01", cn: 1 },
            3: { text: "bad thing02", autoAck: false, c: "cat01", cn: 2 },
            7: { text: "bad thing03", autoAck: false, c: "cat01", cn: 3 },
            99: { text: "bad thing03", autoAck: false, c: "cat01", cn: 3 }, //to high number
        };

        writeFileSync(defFile(NAME), JSON.stringify(externalAlarmDefs), {
            encoding: "utf-8",
        });
        const alarmDef = new PersistentRuntype(
            defFile(NAME),
            AlarmDefsInfo,
            externalAlarmDefs
        );

        jest.useFakeTimers();
        const d1 = new Date(2020, 11, 24, 7, 10, 123);
        jest.setSystemTime(d1);
        const h = new AlarmHandler(NAME, config, alarmDef);

        const internalDefs = (h as any)._alarmDefs.getValue();
        const internalPres = (h as any)._presentAlarms.getValue();
        const defObj = getDefFileObj(NAME);
        const presObj = getPresFileObj(NAME);
        const traceFileContent = getTraceFile(NAME);

        expect(internalDefs).toEqual(defObj);
        expect(defObj).toEqual({
            1: { text: "bad thing01", autoAck: false, c: "cat01", cn: 1 },
            2: { autoAck: false, c: "default", cn: 0, text: "No text" },
            3: { text: "bad thing02", autoAck: false, c: "cat01", cn: 2 },
            4: { autoAck: false, c: "default", cn: 0, text: "No text" },
            5: { autoAck: false, c: "default", cn: 0, text: "No text" },
            6: { autoAck: false, c: "default", cn: 0, text: "No text" },
            7: { text: "bad thing03", autoAck: false, c: "cat01", cn: 3 },
            8: { autoAck: false, c: "default", cn: 0, text: "No text" },
            9: { autoAck: false, c: "default", cn: 0, text: "No text" },
            10: { autoAck: false, c: "default", cn: 0, text: "No text" },
            99: { text: "bad thing03", autoAck: false, c: "cat01", cn: 3 },
        });
        expect(internalPres).toEqual(presObj);
        expect(presObj).toEqual({
            time: "2020-12-24T06:12:03.000Z",
            alarms: {},
        });
        expect(traceFileContent).toBe(
            "alarmNum;occurred;disappeared;acknowledged;autoAck;category;categoryNum;text\n"
        );

        expect(h.name).toBe(NAME);
        expect(h.numOfAlarms).toBe(config.numOfAlarms);

        expect(h[1].toJSON()).toEqual({
            category: "cat01",
            categoryNum: 1,
            text: "bad thing01",
        });
        expect(h[2].toJSON()).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });
        expect(h[3].toJSON()).toEqual({
            category: "cat01",
            categoryNum: 2,
            text: "bad thing02",
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
            category: "cat01",
            categoryNum: 3,
            text: "bad thing03",
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
        expect(h[99]).toBeUndefined(); //not created because of number setting
    });

    it("should throw if no alarmdefs path and no persistant alarm def is given", () => {
        expect(() => {
            const NAME = "al03";
            const config = {
                numOfAlarms: 3,
                traceFilePath: traceFile(NAME),
                presentAlarmsFilePath: presFile(NAME),
            };
            const h = new AlarmHandler(NAME, config);
        }).toThrow();
    });

    it("should use existing present alarms", () => {
        const NAME = "al04";
        const config = createConfig(NAME, 4);
        const d1 = new Date(2020, 11, 24, 7, 10, 30, 123);
        const d2 = new Date(2020, 11, 24, 7, 15, 30, 123);
        const d3 = new Date(2020, 11, 24, 7, 20, 30, 123);
        const alarmDefs: tAlarmDefsInfo = {
            1: { text: "bad thing01", autoAck: false, c: "cat01", cn: 1 },
            2: { text: "bad thing02", autoAck: false, c: "cat02", cn: 2 },
            3: { text: "bad thing03", autoAck: false, c: "cat03", cn: 3 },
            4: { text: "bad thing04", autoAck: false, c: "cat04", cn: 4 },
        };
        writeFileSync(defFile(NAME), JSON.stringify(alarmDefs), {
            encoding: "utf-8",
        });
        const presentAlarms: tPresentAlarmsInfo = {
            time: d3.toJSON(),
            alarms: {
                1: { category: "a", categoryNum: 1, text: "abc" },
                2: {
                    category: "a",
                    categoryNum: 1,
                    text: "abc",
                    occurred: d1.toJSON(),
                },
                3: {
                    category: "a",
                    categoryNum: 1,
                    text: "abc",
                    occurred: d2.toJSON(),
                    ackTime: d3.toJSON(),
                },
                4: {
                    category: "a",
                    categoryNum: 1,
                    text: "abc",
                    ackTime: d3.toJSON(),
                }, //inconsistent
            },
        };
        writeFileSync(presFile(NAME), JSON.stringify(presentAlarms), {
            encoding: "utf-8",
        });
        const h = new AlarmHandler(NAME, config);
        expect(h[1].toJSON()).toEqual({
            category: "cat01",
            categoryNum: 1,
            text: "bad thing01",
        });
        expect(h[2].toJSON()).toEqual({
            category: "cat02",
            categoryNum: 2,
            text: "bad thing02",
            occurred: d1.toJSON(),
        });
        expect(h[3].toJSON()).toEqual({
            category: "cat03",
            categoryNum: 3,
            text: "bad thing03",
            occurred: d2.toJSON(),
            ackTime: d3.toJSON(),
        });
        expect(h[4].toJSON()).toEqual({
            category: "cat04",
            categoryNum: 4,
            text: "bad thing04",
        });
    });

    it("should set alarm text if alarm is found", () => {
        const NAME = "al05";
        const CONFIG = createConfig(NAME, 3);
        jest.useFakeTimers();
        const d1 = new Date(2020, 11, 24, 7, 10, 123);
        jest.setSystemTime(d1);
        const h = new AlarmHandler(NAME, CONFIG);
        expect(getDefFileObj(NAME)).toEqual({
            1: { autoAck: false, c: "default", cn: 0, text: "No text" },
            2: { autoAck: false, c: "default", cn: 0, text: "No text" },
            3: { autoAck: false, c: "default", cn: 0, text: "No text" },
        });
        expect(h.setAlarmText(1, "A")).toBe(true);
        expect(getDefFileObj(NAME)).toEqual({
            1: { autoAck: false, c: "default", cn: 0, text: "A" },
            2: { autoAck: false, c: "default", cn: 0, text: "No text" },
            3: { autoAck: false, c: "default", cn: 0, text: "No text" },
        });
        expect(h.setAlarmText(2, "B")).toBe(true);
        expect(getDefFileObj(NAME)).toEqual({
            1: { autoAck: false, c: "default", cn: 0, text: "A" },
            2: { autoAck: false, c: "default", cn: 0, text: "B" },
            3: { autoAck: false, c: "default", cn: 0, text: "No text" },
        });
        expect(h.setAlarmText(3, "C")).toBe(true);
        expect(getDefFileObj(NAME)).toEqual({
            1: { autoAck: false, c: "default", cn: 0, text: "A" },
            2: { autoAck: false, c: "default", cn: 0, text: "B" },
            3: { autoAck: false, c: "default", cn: 0, text: "C" },
        });
        expect(h.setAlarmText(4, "D")).toBe(false);
        expect(getDefFileObj(NAME)).toEqual({
            1: { autoAck: false, c: "default", cn: 0, text: "A" },
            2: { autoAck: false, c: "default", cn: 0, text: "B" },
            3: { autoAck: false, c: "default", cn: 0, text: "C" },
        });
        expect(h[1].text).toBe("A");
        expect(h[2].text).toBe("B");
        expect(h[3].text).toBe("C");
    });
});

describe("alarm signal test", () => {
    const cbNew = jest.fn();
    const cbGone = jest.fn();
    const cbAck = jest.fn();
    const cbSignalChanged = jest.fn();
    const cbPresAlarmChanged = jest.fn();
    const d1 = new Date(2020, 11, 24, 7, 10, 123);
    let h: AlarmHandler;
    let prefixNr = 100;

    beforeEach(() => {
        const NAME = `alSig_${prefixNr++}`;
        const CONFIG = createConfig(NAME, 3);
        jest.useFakeTimers();
        jest.setSystemTime(d1);
        jest.clearAllMocks();
        h = new AlarmHandler(NAME, CONFIG);
        h.on("new", cbNew);
        h.on("gone", cbGone);
        h.on("ack", cbAck);
        h.on("signalChanged", cbSignalChanged);
        h.on("presentAlarmsChanged", cbPresAlarmChanged);
    });

    it("should emit new event and return true for set signal", () => {
        h[2].text = "$1 $2 $3";
        expect(h.updateSignal(1, false)).toBe(true);
        expect(h.updateSignal(2, true, "A", 10, 30)).toBe(true);
        expect(h.updateSignal(3, false)).toBe(true);
        const presentAlarmsExt = getPresFileObj(h.name);
        expect(presentAlarmsExt).toEqual({
            time: d1.toJSON(),
            alarms: {
                2: {
                    category: "default",
                    categoryNum: 0,
                    text: "A 10 30",
                    occurred: d1.toJSON(),
                },
            },
        });
        expect(cbNew).toBeCalledTimes(1);
        expect(cbGone).not.toBeCalled();
        expect(cbAck).not.toBeCalled();
        expect(cbSignalChanged).toBeCalledTimes(1);
        expect(cbPresAlarmChanged).toBeCalledTimes(2);
        let [nr, obj] = cbNew.mock.calls[0];
        expect(nr).toBe(2);
        expect(obj).toEqual({
            category: "default",
            categoryNum: 0,
            text: "A 10 30",
            occurred: d1.toJSON(),
        });
        [obj] = cbPresAlarmChanged.mock.calls[0];
        expect(obj).toEqual({
            time: d1.toJSON(),
            alarms: {
                2: {
                    category: "default",
                    categoryNum: 0,
                    text: "A 10 30",
                    occurred: d1.toJSON(),
                },
            },
        });

        [nr, obj] = cbSignalChanged.mock.calls[0];
        expect(nr).toBe(2);
        expect(obj).toEqual({
            category: "default",
            categoryNum: 0,
            text: "A 10 30",
            occurred: d1.toJSON(),
        });
        [obj] = cbPresAlarmChanged.mock.calls[1];
        expect(obj).toEqual({
            time: d1.toJSON(),
            alarms: {
                2: {
                    category: "default",
                    categoryNum: 0,
                    text: "A 10 30",
                    occurred: d1.toJSON(),
                },
            },
        });
    });

    it("should return false if no alarm for signal is found", () => {
        expect(h.updateSignal(7, true)).toBe(false);
    });

    it("should set acknowledge for triggered alarm", (done) => {
        h.updateSignal(1, false);
        h.updateSignal(2, true);
        h.updateSignal(3, false);
        jest.clearAllMocks();

        h.acknowledgeAlarm(2);
        let presentAlarmsExt = getPresFileObj(h.name);
        expect(presentAlarmsExt).toEqual({
            time: d1.toJSON(),
            alarms: {
                2: {
                    category: "default",
                    categoryNum: 0,
                    text: "No text",
                    occurred: d1.toJSON(),
                    ackTime: d1.toJSON(),
                },
            },
        });

        expect(cbNew).not.toBeCalled();
        expect(cbGone).not.toBeCalled();
        expect(cbAck).toBeCalledTimes(1);
        expect(cbSignalChanged).not.toBeCalled();
        expect(cbPresAlarmChanged).toBeCalledTimes(1);
        let [nr, obj] = cbAck.mock.calls[0];
        expect(nr).toBe(2);
        expect(obj).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
            occurred: d1.toJSON(),
            ackTime: d1.toJSON(),
        });
        [obj] = cbPresAlarmChanged.mock.calls[0];
        expect(obj).toEqual({
            time: d1.toJSON(),
            alarms: {
                2: {
                    category: "default",
                    categoryNum: 0,
                    text: "No text",
                    occurred: d1.toJSON(),
                    ackTime: d1.toJSON(),
                },
            },
        });

        jest.clearAllMocks();

        h.updateSignal(1, false);
        h.updateSignal(2, false);
        h.updateSignal(3, false);
        presentAlarmsExt = getPresFileObj(h.name);
        expect(presentAlarmsExt).toEqual({
            time: d1.toJSON(),
            alarms: {},
        });

        expect(cbNew).not.toBeCalled();
        expect(cbGone).toBeCalledTimes(1);
        expect(cbAck).not.toBeCalled();
        expect(cbSignalChanged).toBeCalledTimes(1);
        expect(cbPresAlarmChanged).toBeCalledTimes(2);
        let trace;
        [nr, trace] = cbGone.mock.calls[0];
        expect(nr).toBe(2);
        expect(trace).toEqual(
            `2;${d1.toJSON()};${d1.toJSON()};${d1.toJSON()};0;default;0;No text`
        );

        [nr, obj] = cbSignalChanged.mock.calls[0];
        expect(nr).toBe(2);
        expect(obj).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });

        [obj] = cbPresAlarmChanged.mock.calls[0];
        expect(obj).toEqual({
            time: d1.toJSON(),
            alarms: {},
        });

        [obj] = cbPresAlarmChanged.mock.calls[1];
        expect(obj).toEqual({
            time: d1.toJSON(),
            alarms: {},
        });

        jest.useRealTimers();
        setTimeout(() => {
            const traceFileContent = getTraceFile(h.name);
            let expectedTraceFileContent =
                "alarmNum;occurred;disappeared;acknowledged;autoAck;category;categoryNum;text\n";
            expectedTraceFileContent += `2;${d1.toJSON()};${d1.toJSON()};${d1.toJSON()};0;default;0;No text\n`;
            expect(traceFileContent).toBe(expectedTraceFileContent);
            done();
        }, 100);
    });

    it("should acknowledge all alarm when 0 is provided", () => {
        h.updateSignal(1, true);
        h.updateSignal(2, true);
        h.updateSignal(3, true);
        jest.clearAllMocks();

        h.acknowledgeAlarm(0);

        jest.clearAllMocks();

        h.updateSignal(1, false);
        h.updateSignal(2, false);
        h.updateSignal(3, false);

        expect(cbNew).not.toBeCalled();
        expect(cbGone).toBeCalledTimes(3);
        expect(cbAck).not.toBeCalled();
        expect(cbSignalChanged).toBeCalledTimes(3);
        expect(cbPresAlarmChanged).toBeCalledTimes(6);
    });

    it("should return false if no alarm is found", () => {
        expect(h.acknowledgeAlarm(7)).toBe(false);
    });

    it("should work with autoAck alarms", () => {
        h[2].autoAck = true;
        h.updateSignal(1, false);
        h.updateSignal(2, true);
        h.updateSignal(3, false);
        jest.clearAllMocks();

        h.updateSignal(1, false);
        h.updateSignal(2, false);
        h.updateSignal(3, false);

        expect(cbNew).not.toBeCalled();
        expect(cbGone).toBeCalledTimes(1);
        expect(cbAck).not.toBeCalled();
        expect(cbSignalChanged).toBeCalledTimes(1);
        expect(cbPresAlarmChanged).toBeCalledTimes(2);
        let trace;
        let nr, obj;
        [nr, trace] = cbGone.mock.calls[0];
        expect(nr).toBe(2);
        expect(trace).toEqual(
            `2;${d1.toJSON()};${d1.toJSON()};;1;default;0;No text`
        );

        [nr, obj] = cbSignalChanged.mock.calls[0];
        expect(nr).toBe(2);
        expect(obj).toEqual({
            category: "default",
            categoryNum: 0,
            text: "No text",
        });

        [obj] = cbPresAlarmChanged.mock.calls[0];
        expect(obj).toEqual({
            time: d1.toJSON(),
            alarms: {},
        });

        [obj] = cbPresAlarmChanged.mock.calls[1];
        expect(obj).toEqual({
            time: d1.toJSON(),
            alarms: {},
        });
    });
});
