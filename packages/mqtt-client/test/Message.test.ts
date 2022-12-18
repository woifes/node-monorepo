// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { rtINT32, rtINT64, rtUINT8, TypeName } from "@woifes/binarytypes";
import * as rt from "runtypes";
import { Client } from "../src/Client";
import { Message } from "../src/Message";
import { MqttClientMock } from "../__mocks__/mqtt";

afterEach(() => {
    jest.clearAllMocks();
});

test("creation", () => {
    let m = new Message("A/B/C", 0, false);
    let now = Date.now();
    expect(m.qos).toBe(0);
    expect(m.retain).toBe(false);
    expect(m.topic).toEqual(["A", "B", "C"]);
    expect(m.publishOpts).toEqual({
        qos: 0,
        retain: false,
    });
    expect(m.body).toEqual(m.body);
    expect(m.body).toEqual("");
    expect(m.creation - now).toBeLessThanOrEqual(1000);

    m = new Message("D/E/F", 1, true);
    now = Date.now();
    expect(m.qos).toBe(1);
    expect(m.retain).toBe(true);
    expect(m.topic).toEqual(["D", "E", "F"]);
    expect(m.publishOpts).toEqual({
        qos: 1,
        retain: true,
    });
    expect(m.body).toEqual("");
    expect(m.creation - now).toBeLessThanOrEqual(1000);

    m = new Message("D/E/F", 2, true);
    now = Date.now();
    expect(m.qos).toBe(2);
    expect(m.retain).toBe(true);
    expect(m.topic).toEqual(["D", "E", "F"]);
    expect(m.publishOpts).toEqual({
        qos: 2,
        retain: true,
    });
    expect(m.body).toEqual("");
    expect(m.creation - now).toBeLessThanOrEqual(1000);

    const config = {
        url: "url01",
        clientId: "id01",
        auth: {
            username: "user01",
            password: "pw",
        },
        caCertificate: "cert",
    };
    const c = new Client(config);
    m = new Message("G/H/I", 0, true, "", c);
    now = Date.now();
    expect(m.qos).toBe(0);
    expect(m.retain).toBe(true);
    expect(m.topic).toEqual(["G", "H", "I"]);
    expect(m.publishOpts).toEqual({
        qos: 0,
        retain: true,
    });
    expect(m.body).toEqual("");
    expect(m.client).toBe(c);
    expect(m.creation - now).toBeLessThanOrEqual(1000);
});

test("copy", () => {
    const config = {
        url: "url01",
        clientId: "id01",
        auth: {
            username: "user01",
            password: "pw",
        },
        caCertificate: "cert",
    };
    const c = new Client(config);

    const m = new Message("A/B/C", 2, true, "Hello World", c);

    const m2 = Message.copy(m);

    expect(m2 === m).toBe(false);
    expect(m2.qos === m.qos).toBe(true);
    expect(m2.retain === m.retain).toBe(true);
    expect(m2.topic === m.topic).toBe(false);
    expect(m2.topic).toEqual(m.topic);
    expect((m2 as any)._body === (m as any)._body).toBe(true);
    expect(m.client === m2.client).toBe(true);
    expect(m.creation === m2.creation).toBe(true);
});

test("read value", () => {
    const m = new Message("A/B/C", 2, true, "");
    //#region INT8
    (m as any)._body = "127";
    expect(m.readValue("INT8")).toBe(127);
    (m as any)._body = "128";
    expect(() => {
        m.readValue("INT8");
    }).toThrow();
    expect(m.readValue("INT8", 99)).toBe(99);
    //#endregion
    //#region UINT8
    (m as any)._body = "255";
    expect(m.readValue("UINT8")).toBe(255);
    (m as any)._body = "256";
    expect(() => {
        m.readValue("UINT8");
    }).toThrow();
    expect(m.readValue("UINT8", 99)).toBe(99);
    //#endregion
    //#region INT16
    (m as any)._body = "32767";
    expect(m.readValue("INT16")).toBe(32767);
    (m as any)._body = "32768";
    expect(() => {
        m.readValue("INT16");
    }).toThrow();
    expect(m.readValue("INT16", 99)).toBe(99);
    //#endregion
    //#region UINT16
    (m as any)._body = "65535";
    expect(m.readValue("UINT16")).toBe(65535);
    (m as any)._body = "65536";
    expect(() => {
        m.readValue("UINT16");
    }).toThrow();
    expect(m.readValue("UINT16", 99)).toBe(99);
    //#endregion
    //#region INT32
    (m as any)._body = "2147483647";
    expect(m.readValue("INT32")).toBe(2147483647);
    (m as any)._body = "2147483648";
    expect(() => {
        m.readValue("INT32");
    }).toThrow();
    expect(m.readValue("INT32", 99)).toBe(99);
    //#endregion
    //#region UINT32
    (m as any)._body = "4294967295";
    expect(m.readValue("UINT32")).toBe(4294967295);
    (m as any)._body = "4294967296";
    expect(() => {
        m.readValue("UINT32");
    }).toThrow();
    expect(m.readValue("UINT32", 99)).toBe(99);
    //#endregion
    //#region INT64
    (m as any)._body = "9223372036854775807";
    expect(m.readValue("INT64")).toBe(9223372036854775807n);
    (m as any)._body = "9223372036854775808";
    expect(() => {
        m.readValue("INT64");
    }).toThrow();
    expect(m.readValue("INT64", 99)).toBe(99);
    //#endregion
    //#region UINT64
    (m as any)._body = "18446744073709551615";
    expect(m.readValue("UINT64")).toBe(18446744073709551615n);
    (m as any)._body = "18446744073709551616";
    expect(() => {
        m.readValue("UINT64");
    }).toThrow();
    expect(m.readValue("UINT64", 99)).toBe(99);
    //#endregion
    //#region FLOAT
    (m as any)._body = "3.7";
    expect(m.readValue("FLOAT")).toBeCloseTo(3.7);
    (m as any)._body = "no number";
    expect(() => {
        m.readValue("FLOAT");
    }).toThrow();
    expect(m.readValue("FLOAT", 99.9)).toBeCloseTo(99.9);
    //#endregion
    //#region DOUBLE
    (m as any)._body = "3.7";
    expect(m.readValue("FLOAT")).toBeCloseTo(3.7);
    (m as any)._body = "no number";
    expect(() => {
        m.readValue("FLOAT");
    }).toThrow();
    expect(m.readValue("FLOAT", 99.9)).toBeCloseTo(99.9);
    //#endregion
    //#region ARRAY_OF_INT8
    (m as any)._body = "[-128, 127, 10]";
    expect(m.readValue("ARRAY_OF_INT8")).toEqual([-128, 127, 10]);
    (m as any)._body = "[-129, 127, 10]";
    expect(() => {
        m.readValue("ARRAY_OF_INT8");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_INT8", [1, 2, 3])).toEqual([1, 2, 3]);
    //#endregion
    //#region ARRAY_OF_UINT8
    (m as any)._body = "[0, 255, 10]";
    expect(m.readValue("ARRAY_OF_UINT8")).toEqual([0, 255, 10]);
    (m as any)._body = "[-1, 255, 10]";
    expect(() => {
        m.readValue("ARRAY_OF_UINT8");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_UINT8", [1, 2, 3])).toEqual([1, 2, 3]);
    //#endregion
    //#region ARRAY_OF_INT16
    (m as any)._body = "[32767, -32768, 10]";
    expect(m.readValue("ARRAY_OF_INT16")).toEqual([32767, -32768, 10]);
    (m as any)._body = "[32767, -32769, 10]";
    expect(() => {
        m.readValue("ARRAY_OF_INT16");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_INT16", [1, 2, 3])).toEqual([1, 2, 3]);
    //#endregion
    //#region ARRAY_OF_UINT16
    (m as any)._body = "[65535, 0, 10]";
    expect(m.readValue("ARRAY_OF_UINT16")).toEqual([65535, 0, 10]);
    (m as any)._body = "[65535, -1, 10]";
    expect(() => {
        m.readValue("ARRAY_OF_UINT16");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_UINT16", [1, 2, 3])).toEqual([1, 2, 3]);
    //#endregion
    //#region ARRAY_OF_INT32
    (m as any)._body = "[2147483647, -2147483648, 10]";
    expect(m.readValue("ARRAY_OF_INT32")).toEqual([
        2147483647, -2147483648, 10,
    ]);
    (m as any)._body = "[2147483647, -2147483649, 10]";
    expect(() => {
        m.readValue("ARRAY_OF_INT32");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_INT32", [1, 2, 3])).toEqual([1, 2, 3]);
    //#endregion
    //#region ARRAY_OF_UINT32
    (m as any)._body = "[4294967295, 0, 10]";
    expect(m.readValue("ARRAY_OF_UINT32")).toEqual([4294967295, 0, 10]);
    (m as any)._body = "[4294967295, -1, 10]";
    expect(() => {
        m.readValue("ARRAY_OF_UINT32");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_UINT32", [1, 2, 3])).toEqual([1, 2, 3]);
    //#endregion
    //#region ARRAY_OF_INT64
    (
        m as any
    )._body = `["9223372036854775807", "-9223372036854775808", "10", "-10"]`;
    expect(m.readValue("ARRAY_OF_INT64")).toEqual([
        9223372036854775807n,
        -9223372036854775808n,
        10n,
        -10n,
    ]);
    (
        m as any
    )._body = `["9223372036854775808", "-9223372036854775808", "10", "-10"]`;
    expect(() => {
        m.readValue("ARRAY_OF_INT64");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_INT64", [1, 2, 3])).toEqual([1, 2, 3]);
    //#endregion
    //#region ARRAY_OF_UINT64
    (m as any)._body = '["18446744073709551615", "0", "10"]';
    expect(m.readValue("ARRAY_OF_UINT64")).toEqual([
        18446744073709551615n,
        0n,
        10n,
    ]);
    (m as any)._body = '["18446744073709551615", "-1", "10"]';
    expect(() => {
        m.readValue("ARRAY_OF_UINT64");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_UINT64", [1, 2, 3])).toEqual([1, 2, 3]);
    //#endregion
    //#region ARRAY_OF_FLOAT
    (m as any)._body = "[3.7, 4.7, 5.7]";
    let res = <number[]>m.readValue("ARRAY_OF_FLOAT");
    expect(res[0]).toBeCloseTo(3.7);
    expect(res[1]).toBeCloseTo(4.7);
    expect(res[2]).toBeCloseTo(5.7);
    (m as any)._body = "no number";
    expect(() => {
        m.readValue("ARRAY_OF_FLOAT");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_FLOAT", 99.9)).toBeCloseTo(99.9);
    //#endregion
    //#region ARRAY_OF_DOUBLE
    (m as any)._body = "[3.7, 4.7, 5.7]";
    res = <number[]>m.readValue("ARRAY_OF_DOUBLE");
    expect(res[0]).toBeCloseTo(3.7);
    expect(res[1]).toBeCloseTo(4.7);
    expect(res[2]).toBeCloseTo(5.7);
    (m as any)._body = "no number";
    expect(() => {
        m.readValue("ARRAY_OF_DOUBLE");
    }).toThrow();
    expect(m.readValue("ARRAY_OF_DOUBLE", 99.9)).toBeCloseTo(99.9);
    //#endregion
});

test("readJSON test", () => {
    const m = new Message("A/B/C", 1, true, "{ a: 1, b: 2, c: 3}");
    expect(m.readJSON()).toEqual({
        a: 1,
        b: 2,
        c: 3,
    });
    (m as any)._body = '{ "a": 1, "b": 2, "c": 3}';
    expect(m.readJSON()).toEqual({
        a: 1,
        b: 2,
        c: 3,
    });
    (m as any)._body = "{ a: 1, b: 2, c: 3} no valid json";
    expect(() => {
        m.readJSON();
    }).toThrow();
    expect(m.readJSON(undefined, 999)).toBe(999);

    const rtTest = rt.Record({
        a: rtUINT8,
        b: rtINT64,
        c: rtINT32,
    });
    (m as any)._body = '{ a: 1, b: "2", c: 3}';
    expect(m.readJSON(rtTest)).toEqual({
        a: 1,
        b: "2",
        c: 3,
    });
    (m as any)._body = "{ a: -1, b: 2, c: 3}";
    expect(() => {
        m.readJSON(rtTest);
    }).toThrow();
    expect(m.readJSON(rtTest, 99)).toBe(99);
});

test("readCommand test", () => {
    const m = new Message("A/B/C", 1, true, `[1,2,3,4]`);
    expect(m.readCommand(["UINT16", "UINT8", "UINT8", "INT32"])).toEqual([
        1, 2, 3, 4,
    ]);
    (m as any)._body = `[1,2,-1,4]`;
    expect(m.readCommand(["UINT16", "UINT8", "UINT8", "INT32"])).toEqual([
        1, 2,
    ]);
    (m as any)._body = `[-1,2,1,4]`;
    expect(m.readCommand(["UINT16", "UINT8", "UINT8", "INT32"])).toEqual([]);
    (m as any)._body = `[1,2,1.3,"Hallo Welt"]`;
    expect(m.readCommand(["UINT16", "UINT8", "UINT8", "STRING"])).toEqual([
        1,
        2,
        1,
        "Hallo Welt",
    ]);
    (m as any)._body = `[1,2,1.3,"Hallo Welt"]`;
    expect(m.readCommand(["UINT16", "UINT8", "FLOAT", "STRING"])).toEqual([
        1,
        2,
        1.3,
        "Hallo Welt",
    ]);
});

test("writeValue test", () => {
    const m = new Message("A/B/C", 1, false);
    let t: TypeName | "STRING" = "INT8";
    //#region INT8
    expect(m.writeValue(127, t)).toBe(true);
    expect(m.body).toEqual("127");
    expect(m.writeValue(-128, t)).toBe(true);
    expect(m.body).toEqual("-128");
    (m as any)._body = "";
    expect(m.writeValue(128, t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue(-129, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region UINT8
    t = "UINT8";
    expect(m.writeValue(255, t)).toBe(true);
    expect(m.body).toEqual("255");
    expect(m.writeValue(0, t)).toBe(true);
    expect(m.body).toEqual("0");
    (m as any)._body = "";
    expect(m.writeValue(256, t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue(-1, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region INT16
    t = "INT16";
    expect(m.writeValue(32767, t)).toBe(true);
    expect(m.body).toEqual("32767");
    expect(m.writeValue(-32768, t)).toBe(true);
    expect(m.body).toEqual("-32768");
    (m as any)._body = "";
    expect(m.writeValue(32768, t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue(-32769, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region UINT16
    t = "UINT16";
    expect(m.writeValue(65535, t)).toBe(true);
    expect(m.body).toEqual("65535");
    expect(m.writeValue(0, t)).toBe(true);
    expect(m.body).toEqual("0");
    (m as any)._body = "";
    expect(m.writeValue(65536, t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue(-1, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region INT32
    t = "INT32";
    expect(m.writeValue(2147483647, t)).toBe(true);
    expect(m.body).toEqual("2147483647");
    expect(m.writeValue(-2147483648, t)).toBe(true);
    expect(m.body).toEqual("-2147483648");
    (m as any)._body = "";
    expect(m.writeValue(2147483648, t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue(-2147483649, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region UINT32
    t = "UINT32";
    expect(m.writeValue(4294967295, t)).toBe(true);
    expect(m.body).toEqual("4294967295");
    expect(m.writeValue(0, t)).toBe(true);
    expect(m.body).toEqual("0");
    (m as any)._body = "";
    expect(m.writeValue(4294967296, t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue(-1, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region INT64
    t = "INT64";
    expect(m.writeValue(9223372036854775807n, t)).toBe(true);
    expect(m.body).toEqual("9223372036854775807");
    expect(m.writeValue(-9223372036854775808n, t)).toBe(true);
    expect(m.body).toEqual("-9223372036854775808");
    (m as any)._body = "";
    expect(m.writeValue(9223372036854775808n, t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue(-9223372036854775809n, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region UINT64
    t = "UINT64";
    expect(m.writeValue(18446744073709551615n, t)).toBe(true);
    expect(m.body).toEqual("18446744073709551615");
    expect(m.writeValue(0n, t)).toBe(true);
    expect(m.body).toEqual("0");
    (m as any)._body = "";
    expect(m.writeValue(18446744073709551616n, t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue(-1n, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region FLOAT
    t = "FLOAT";
    expect(m.writeValue(12.3, t)).toBe(true);
    expect(m.body).toEqual("12.3");
    (m as any)._body = "";
    expect(m.writeValue(NaN, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region DOUBLE
    t = "DOUBLE";
    expect(m.writeValue(12.3, t)).toBe(true);
    expect(m.body).toEqual("12.3");
    (m as any)._body = "";
    expect(m.writeValue(NaN, t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region STRING
    t = "STRING";
    expect(m.writeValue(12.3, t)).toBe(true);
    expect(m.body).toEqual("12.3");
    (m as any)._body = "";
    expect(m.writeValue(Buffer.alloc(0), "STRING")).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
});

test("writeValue Arrays test", () => {
    const m = new Message("A/B/C", 1, false);
    let t: TypeName = "ARRAY_OF_INT8";
    //#region ARRAY_OF_INT8
    expect(m.writeValue([127, -128, 10], t)).toBe(true);
    expect(m.body).toEqual(`[127,-128,10]`);
    (m as any)._body = "";
    expect(m.writeValue([128, -128, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([127, -129, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region ARRAY_OF_UINT8
    t = "ARRAY_OF_UINT8";
    expect(m.writeValue([255, 0, 10], t)).toBe(true);
    expect(m.body).toEqual(`[255,0,10]`);
    (m as any)._body = "";
    expect(m.writeValue([256, 0, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([255, -1, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region ARRAY_OF_INT16
    t = "ARRAY_OF_INT16";
    expect(m.writeValue([32767, -32768, 10], t)).toBe(true);
    expect(m.body).toEqual(`[32767,-32768,10]`);
    (m as any)._body = "";
    expect(m.writeValue([32768, -32768, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([32767, -32769, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region ARRAY_OF_UINT16
    t = "ARRAY_OF_UINT16";
    expect(m.writeValue([65535, 0, 10], t)).toBe(true);
    expect(m.body).toEqual(`[65535,0,10]`);
    (m as any)._body = "";
    expect(m.writeValue([65536, 0, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([65535, -1, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region ARRAY_OF_INT32
    t = "ARRAY_OF_INT32";
    expect(m.writeValue([2147483647, -2147483648, 10], t)).toBe(true);
    expect(m.body).toEqual(`[2147483647,-2147483648,10]`);
    (m as any)._body = "";
    expect(m.writeValue([2147483648, -2147483648, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([2147483647, -2147483649, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region ARRAY_OF_UINT32
    t = "ARRAY_OF_UINT32";
    expect(m.writeValue([4294967295, 0, 10], t)).toBe(true);
    expect(m.body).toEqual(`[4294967295,0,10]`);
    (m as any)._body = "";
    expect(m.writeValue([4294967296, 0, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([4294967295, -1, 10], t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region ARRAY_OF_INT64
    t = "ARRAY_OF_INT64";
    expect(
        m.writeValue([9223372036854775807n, -9223372036854775808n, 10n], t)
    ).toBe(true);
    expect(m.body).toEqual(
        `["9223372036854775807","-9223372036854775808","10"]`
    );
    (m as any)._body = "";
    expect(
        m.writeValue([9223372036854775808n, -9223372036854775808n, 10n], t)
    ).toBe(false);
    expect(m.body).toEqual("");
    expect(
        m.writeValue([9223372036854775807n, -9223372036854775809n, 10n], t)
    ).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region ARRAY_OF_UINT64
    t = "ARRAY_OF_UINT64";
    expect(m.writeValue([18446744073709551615n, 0n, 10n], t)).toBe(true);
    expect(m.body).toEqual(`["18446744073709551615","0","10"]`);
    (m as any)._body = "";
    expect(m.writeValue([18446744073709551616n, 0n, 10n], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([18446744073709551615n, -1n, 10n], t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region ARRAY_OF_FLOAT
    t = "ARRAY_OF_FLOAT";
    expect(m.writeValue([12.3, -12.3, 0.0], t)).toBe(true);
    expect(m.body).toEqual(`[12.3,-12.3,0]`);
    (m as any)._body = "";
    expect(m.writeValue([NaN, -12.3, 0.0], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([12.3, Infinity, 0.0], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([12.3, -12.3, -Infinity], t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
    //#region ARRAY_OF_DOUBLE
    t = "ARRAY_OF_DOUBLE";
    expect(m.writeValue([12.3, -12.3, 0.0], t)).toBe(true);
    expect(m.body).toEqual(`[12.3,-12.3,0]`);
    (m as any)._body = "";
    expect(m.writeValue([NaN, -12.3, 0.0], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([12.3, Infinity, 0.0], t)).toBe(false);
    expect(m.body).toEqual("");
    expect(m.writeValue([12.3, -12.3, -Infinity], t)).toBe(false);
    expect(m.body).toEqual("");
    //#endregion
});

test("writeJSON test", () => {
    const m = new Message("A/B/C", 1, true);
    expect(m.writeJSON({ a: 1, b: 2, c: 3 })).toBe(true);
    expect(m.body).toEqual(`{"a":1,"b":2,"c":3}`);
});

describe("send to internal client", () => {
    const config = {
        url: "url01",
        clientId: "id01",
        auth: {
            username: "user01",
            password: "pw",
        },
        caCertificate: "cert",
    };
    const c = new Client(config);
    const mqttClient = (c as any)._mqttClient as MqttClientMock;
    mqttClient.connected = true;

    it("should send via async send method", () => {
        const m = new Message("A/B/C", 0, false, "123", c);
        expect(m.send()).resolves.toBeUndefined();
        expect(mqttClient.publish).toBeCalledTimes(1);
        const [topic, payload, publishOpts, cb] =
            mqttClient.publish.mock.calls[0];
        expect(topic).toBe("A/B/C");
        expect(payload).toBe(`123`);
        expect(publishOpts.qos).toBe(0);
        expect(publishOpts.retain).toBe(false);
    });

    it("should fail when no client is set (async)", () => {
        const m = new Message("A/B/C", 0, false, "123");
        expect(m.send()).rejects.toBeTruthy();
    });

    it("should send via send method", (done) => {
        const m = new Message("A/B/C", 0, false, "123", c);
        m.sendSync();
        setTimeout(() => {
            expect(mqttClient.publish).toBeCalledTimes(1);
            const [topic, payload, publishOpts, cb] =
                mqttClient.publish.mock.calls[0];
            expect(topic).toBe("A/B/C");
            expect(payload).toBe(`123`);
            expect(publishOpts.qos).toBe(0);
            expect(publishOpts.retain).toBe(false);
            done();
        }, 30);
    });

    it("should fail when no client is set", (done) => {
        const m = new Message("A/B/C", 0, false, "123");
        m.sendSync();
        setTimeout(() => {
            expect(mqttClient.publish).not.toBeCalled();
            done();
        }, 30);
    });
});
