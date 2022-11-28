// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { tAlarmJsonObject } from "packages/alarmhandler/src/Alarm/AlarmJsonObject";
import { Alarm } from "../../src/Alarm/Alarm";
import { tAlarmDefinition } from "../../src/Alarm/AlarmDefinition";

jest.useFakeTimers();

const testAlarmDef: tAlarmDefinition = {
    autoAck: false,
    c: "category01",
    cn: 1,
    text: "bad thing happened",
};

const testAlarmDefAutoAck: tAlarmDefinition = {
    autoAck: true,
    c: "category01",
    cn: 1,
    text: "bad thing happened",
};

afterEach(() => {
    jest.clearAllMocks();
});

describe("creation test", () => {
    it("should create standard alarm object", () => {
        const a = new Alarm(1, testAlarmDef);
        expect(a.signal).toBe(false);
        expect(a.triggered).toBe(false);
        expect(a.ack).toBe(false);
        expect(a.autoAck).toBe(false);
        expect(a.text).toBe("bad thing happened");
        expect((a as any)._bitMask).toBe(0);
        expect(a.toJSON()).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            text: "bad thing happened",
        });
    });

    it("should set text and autoAck", () => {
        const a = new Alarm(1, testAlarmDef);
        expect(a.signal).toBe(false);
        expect(a.triggered).toBe(false);
        expect(a.ack).toBe(false);
        expect(a.autoAck).toBe(false);
        expect(a.text).toBe("bad thing happened");
        expect((a as any)._bitMask).toBe(0);
        expect(a.toJSON()).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            text: "bad thing happened",
        });

        a.text = "new bad thing happened";
        expect(a.signal).toBe(false);
        expect(a.triggered).toBe(false);
        expect(a.ack).toBe(false);
        expect(a.autoAck).toBe(false);
        expect(a.text).toBe("new bad thing happened");
        expect((a as any)._bitMask).toBe(0);
        expect(a.toJSON()).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            text: "new bad thing happened",
        });

        a.autoAck = true;
        expect(a.signal).toBe(false);
        expect(a.triggered).toBe(false);
        expect(a.ack).toBe(false);
        expect(a.autoAck).toBe(true);
        expect(a.text).toBe("new bad thing happened");
        expect((a as any)._bitMask).toBe(0);
        expect(a.toJSON()).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            text: "new bad thing happened",
        });
    });
});

describe("creation with existing alarm object", () => {
    const existing: tAlarmJsonObject = {
        category: "new category",
        categoryNum: 99,
        text: "not necessary",
    };

    it("should use existing alarmobject without info", () => {
        const a = new Alarm(1, testAlarmDef, existing);
        expect(a.toJSON()).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            text: "bad thing happened",
        });
        expect((a as any)._bitMask).toBe(0);
    });

    it("should use existing alarmobject with triggered alarm", () => {
        const e = { ...existing };
        const d1 = new Date(2020, 11, 24, 7, 10, 123).toJSON();
        e.occured = d1;
        const a = new Alarm(1, testAlarmDef, e);
        expect(a.toJSON()).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            occured: d1,
            text: "bad thing happened",
        });
        expect((a as any)._bitMask).toBe(2);
    });

    it("should use existing alarmobject with acknowledged alarm", () => {
        const e = { ...existing };
        const d1 = new Date(2020, 11, 24, 7, 10, 123).toJSON();
        const d2 = new Date(2020, 11, 24, 7, 15, 123).toJSON();
        e.occured = d1;
        e.ackTime = d2;
        const a = new Alarm(1, testAlarmDef, e);
        expect(a.toJSON()).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            occured: d1,
            ackTime: d2,
            text: "bad thing happened",
        });
        expect((a as any)._bitMask).toBe(7);
    });

    it("should handle inconsistent alarm", () => {
        const e = { ...existing };
        const d1 = new Date(2020, 11, 24, 7, 10, 123).toJSON();
        e.ackTime = d1;
        const a = new Alarm(1, testAlarmDef, e);
        expect(a.toJSON()).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            text: "bad thing happened",
        });
        expect((a as any)._bitMask).toBe(0);
    });
});

describe("trigger and ack alarm test", () => {
    const cbNew = jest.fn();
    const cbGone = jest.fn();
    const cbAck = jest.fn();

    it("should trigger on signal, stay triggered on signal away and then be gone when acknowledged", () => {
        const d1 = new Date(2020, 2, 3, 4, 5, 6, 7);
        jest.setSystemTime(d1);
        const a = new Alarm(1, testAlarmDef);
        a.on("new", cbNew);
        a.on("gone", cbGone);
        a.on("ack", cbAck);

        a.setSignal(true);

        expect(a.signal).toBe(true);
        expect(a.triggered).toBe(true);
        expect((a as any)._bitMask).toBe(3);
        expect((a as any)._occured.getTime()).toBe(d1.getTime());
        expect(cbNew).toBeCalledTimes(1);
        expect(cbGone).not.toBeCalled();
        expect(cbAck).not.toBeCalled();
        expect(cbNew.mock.calls[0][0]).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            occured: d1.toJSON(),
            text: "bad thing happened",
        });

        jest.clearAllMocks();
        a.setSignal(false);

        expect(a.signal).toBe(false);
        expect(a.triggered).toBe(true);
        expect((a as any)._bitMask).toBe(2);
        expect((a as any)._occured.getTime()).toBe(d1.getTime());
        expect(cbNew).not.toBeCalled();
        expect(cbGone).not.toBeCalled();
        expect(cbAck).not.toBeCalled();

        jest.clearAllMocks();
        const d2 = new Date(2020, 2, 3, 4, 10, 6, 7); //10mins later
        jest.setSystemTime(d2);

        a.ack = true;
        expect(a.signal).toBe(false);
        expect(a.triggered).toBe(false);
        expect(a.ack).toBe(false); //will be reset immediately
        expect((a as any)._bitMask).toBe(0);
        expect((a as any)._occured).toBeUndefined();
        expect((a as any)._ackTime).toBeUndefined();
        expect(cbNew).not.toBeCalled();
        expect(cbGone).toBeCalledTimes(1);
        expect(cbGone.mock.calls[0][0]).toBe(
            `1;${d1.toJSON()};${d2.toJSON()};${d2.toJSON()};0;${
                testAlarmDef.c
            };${testAlarmDef.cn};${testAlarmDef.text}`
        );
        expect(cbAck).toBeCalledTimes(1);
        expect(cbAck.mock.calls[0][0]).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            occured: d1.toJSON(),
            ackTime: d2.toJSON(),
            text: "bad thing happened",
        });
    });

    it("should trigger on signal, be acknowledged and then reset when signal goes away", () => {
        const d1 = new Date(2020, 2, 3, 4, 5, 6, 7);
        jest.setSystemTime(d1);
        const a = new Alarm(1, testAlarmDef);
        a.on("new", cbNew);
        a.on("gone", cbGone);
        a.on("ack", cbAck);

        a.setSignal(true);

        expect((a as any)._bitMask).toBe(3);
        expect((a as any)._occured.getTime()).toBe(d1.getTime());
        expect(cbNew).toBeCalledTimes(1);
        expect(cbGone).not.toBeCalled();
        expect(cbAck).not.toBeCalled();

        const d2 = new Date(2020, 2, 3, 4, 10, 6, 7); //5mins later
        jest.clearAllMocks();
        jest.setSystemTime(d2);

        a.ack = true;
        expect((a as any)._bitMask).toBe(7);
        expect((a as any)._occured.getTime()).toBe(d1.getTime());
        expect((a as any)._ackTime.getTime()).toBe(d2.getTime());
        expect(cbNew).not.toBeCalled();
        expect(cbGone).not.toBeCalled();
        expect(cbAck).toBeCalledTimes(1);
        expect(cbAck.mock.calls[0][0]).toEqual({
            category: testAlarmDef.c,
            categoryNum: testAlarmDef.cn,
            occured: d1.toJSON(),
            ackTime: d2.toJSON(),
            text: "bad thing happened",
        });

        const d3 = new Date(2020, 2, 3, 4, 15, 6, 7); //5mins later
        jest.clearAllMocks();
        jest.setSystemTime(d3);

        a.setSignal(false);
        expect((a as any)._bitMask).toBe(0);
        expect((a as any)._occured).toBeUndefined();
        expect((a as any)._ackTime).toBeUndefined();
        expect(cbNew).not.toBeCalled();
        expect(cbGone).toBeCalledTimes(1);
        expect(cbGone.mock.calls[0][0]).toBe(
            `1;${d1.toJSON()};${d3.toJSON()};${d2.toJSON()};0;${
                testAlarmDef.c
            };${testAlarmDef.cn};${testAlarmDef.text}`
        );
        expect(cbAck).not.toBeCalled();
    });

    it("should set signal and trigger and auto ack if flag is set", () => {
        const d1 = new Date(2020, 2, 3, 4, 5, 6, 7);
        jest.setSystemTime(d1);
        const a = new Alarm(1, testAlarmDef);
        a.on("new", cbNew);
        a.on("gone", cbGone);
        a.on("ack", cbAck);
        a.setSignal(true);
        a.autoAck = true;
        expect(cbNew).toBeCalledTimes(1);
        expect(cbGone).not.toBeCalled();
        expect(cbAck).not.toBeCalled();

        jest.clearAllMocks();
        const d2 = new Date(2020, 2, 3, 4, 10, 6, 7); //5mins later
        jest.setSystemTime(d2);

        a.setSignal(false);

        expect((a as any)._bitMask).toBe(0);
        expect((a as any)._occured).toBeUndefined();
        expect((a as any)._ackTime).toBeUndefined();
        expect(cbNew).not.toBeCalled();
        expect(cbGone).toBeCalledTimes(1);
        expect(cbGone.mock.calls[0][0]).toBe(
            `1;${d1.toJSON()};${d2.toJSON()};;1;${testAlarmDef.c};${
                testAlarmDef.cn
            };${testAlarmDef.text}`
        );
        expect(cbAck).not.toBeCalled();
    });

    it("should set parameter on trigger", () => {
        const d1 = new Date(2020, 2, 3, 4, 5, 6, 7);
        jest.setSystemTime(d1);
        const def = { ...testAlarmDef };
        def.text = "$1 $2 $3";
        def.autoAck = true;
        const a = new Alarm(1, def);
        a.on("new", cbNew);
        a.on("gone", cbGone);
        a.on("ack", cbAck);
        a.setSignal(false, "a", 1, 2);
        a.setSignal(false, "a", 1, 2);
        a.setSignal(true, "A", 10, 20);
        expect(cbNew).toBeCalledTimes(1);
        expect(a.text).toBe("A 10 20");
        expect(cbNew.mock.calls[0][0]).toEqual({
            category: def.c,
            categoryNum: def.cn,
            occured: d1.toJSON(),
            text: "A 10 20",
        });
        a.setSignal(false, "c", -1, -3);
        expect(a.triggered).toBe(false);
        expect(a.text).toBe("$1 $2 $3");
        expect(cbGone.mock.calls[0][0]).toBe(
            `1;${d1.toJSON()};${d1.toJSON()};;1;${def.c};${def.cn};A 10 20`
        );
    });
});
