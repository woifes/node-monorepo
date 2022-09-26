// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { FloatDataType } from "../../src/FloatDataType";

function PROOF_BUFFER(buf: Buffer, hexVal: string) {
    return buf.equals(Buffer.from(hexVal, "hex"));
}

function hexBuf(hex: string) {
    return Buffer.from(hex, "hex");
}

const X_4_7 = "66669640";
const X_4_7_BE = "40966666";
const X_1156 = "00809044";
const X_1156_BE = "44908000";
const X_M1156 = "008090C4";
const X_M1156_BE = "c4908000";
const X_DB_4_7 = "cdcccccccccc1240";
const X_DB_4_7_BE = "4012cccccccccccd";
const X_DB_1156 = "0000000000109240";
const X_DB_1156_BE = "4092100000000000";
const X_DB_M1156 = "00000000001092c0";
const X_DB_M1156_BE = "c092100000000000";
//let BUF_4_7 = hexBuf(hex4_7);
//let BUF_1156 = hexBuf(hex1156);
//let BUF_M1156 = hexBuf(hexM1156);
//let BUF_4_7_BE = hexBuf(hex4_7_BE);
//let BUF_1156_BE = hexBuf(hex1156_BE);
//let BUF_M1156_BE = hexBuf(hexM1156_BE);

const dtFloat = new FloatDataType(4);
const dtDouble = new FloatDataType(8);

function testCheck(dt: FloatDataType, BUF_4_7: Buffer, BUF_4_7_BE: Buffer) {
    //number
    expect(dt.check(3.4)).toBeCloseTo(3.4);
    expect(dt.check(-3.4)).toBeCloseTo(-3.4);
    expect(() => {
        dt.check(NaN);
    }).toThrow();
    expect(() => {
        dt.check(Infinity);
    }).toThrow();
    expect(() => {
        dt.check(-Infinity);
    }).toThrow();
    //string
    expect(dt.check("3.4")).toBeCloseTo(3.4);
    expect(dt.check("-3.4")).toBeCloseTo(-3.4);
    expect(() => {
        dt.check("no number");
    }).toThrow();
    //bigint
    expect(dt.check(11111n)).toBeCloseTo(11111);
    expect(dt.check(-12345n)).toBeCloseTo(-12345);
    //number[]
    expect(() => {
        dt.check([1, 2, 3]);
    }).toThrow();
    //string[]
    expect(() => {
        dt.check(["1", "2", "3"]);
    }).toThrow();
    expect(() => {
        dt.check(["1", "no number", "3"]);
    }).toThrow();
    //bigint[]
    expect(() => {
        dt.check([1n, 2n, 3n]);
    }).toThrow();
    //buffer
    expect(dt.check(BUF_4_7)).toBeCloseTo(4.7);
    expect(dt.check(BUF_4_7_BE, false)).toBeCloseTo(4.7);
    expect(() => {
        dt.check(Buffer.alloc(5));
    }).toThrow();
    expect(() => {
        dt.check(Buffer.alloc(3));
    }).toThrow();
    //buffer[]
    expect(() => {
        dt.check([BUF_4_7, BUF_4_7, BUF_4_7]);
    }).toThrow();
    expect(() => {
        dt.check([BUF_4_7, BUF_4_7, Buffer.alloc(BUF_4_7.length + 1)]);
    }).toThrow();
    expect(() => {
        dt.check([BUF_4_7, BUF_4_7, Buffer.alloc(BUF_4_7.length + -1)]);
    }).toThrow();
}

function testValidate(dt: FloatDataType, BUF_4_7: Buffer, BUF_4_7_BE: Buffer) {
    //number
    expect(dt.validate(3.4)).toBe(true);
    expect(dt.validate(-3.4)).toBe(true);
    expect(dt.validate(NaN)).toBe(false);
    expect(dt.validate(Infinity)).toBe(false);
    expect(dt.validate(-Infinity)).toBe(false);
    //string
    expect(dt.validate("3.4")).toBe(true);
    expect(dt.validate("-3.4")).toBe(true);
    expect(dt.validate("no number")).toBe(false);
    //bigint
    expect(dt.validate(11111n)).toBe(true);
    expect(dt.validate(-12345n)).toBe(true);
    //number[]
    expect(dt.validate([1, 2, 3])).toBe(false);
    //string[]
    expect(dt.validate(["1", "2", "3"])).toBe(false);
    expect(dt.validate(["1", "no number", "3"])).toBe(false);
    //bigint[]
    expect(dt.validate([1n, 2n, 3n])).toBe(false);
    //buffer
    expect(dt.validate(BUF_4_7)).toBe(true);
    expect(dt.validate(Buffer.alloc(5))).toBe(false);
    expect(dt.validate(Buffer.alloc(3))).toBe(false);
    //buffer[]
    expect(dt.validate([BUF_4_7, BUF_4_7, BUF_4_7])).toBe(false);
    expect(dt.validate([BUF_4_7, BUF_4_7, Buffer.alloc(3)])).toBe(false);
    expect(dt.validate([BUF_4_7, BUF_4_7, Buffer.alloc(5)])).toBe(false);
}

function testToBuffer(
    dt: FloatDataType,
    hex4_7: string,
    hex4_7_BE: string,
    hex1156: string,
    hex1156_BE: string,
    hexM1156: string,
    hexM1156_BE: string
) {
    const BUF_4_7 = hexBuf(hex4_7);
    //number
    expect(PROOF_BUFFER(dt.toBuffer(4.7), hex4_7)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(4.7, false), hex4_7_BE)).toBe(true);
    expect(() => {
        dt.toBuffer(NaN);
    }).toThrow();
    expect(() => {
        dt.toBuffer(Infinity);
    }).toThrow();
    expect(() => {
        dt.toBuffer(-Infinity);
    }).toThrow();
    //string
    expect(PROOF_BUFFER(dt.toBuffer("4.7"), hex4_7)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("4.7", false), hex4_7_BE)).toBe(true);
    expect(() => {
        dt.toBuffer("no number");
    }).toThrow();
    //bigint
    expect(PROOF_BUFFER(dt.toBuffer(1156n), hex1156)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(-1156n), hexM1156)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(1156n, false), hex1156_BE)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(-1156n, false), hexM1156_BE)).toBe(true);
    //number[]
    expect(() => {
        dt.toBuffer([1, 2, 3]);
    }).toThrow();
    //string[]
    expect(() => {
        dt.toBuffer(["1", "2", "3"]);
    }).toThrow();
    expect(() => {
        dt.toBuffer(["1", "no number", "3"]);
    }).toThrow();
    //bigint[]
    expect(() => {
        dt.toBuffer([1n, 2n, 3n]);
    }).toThrow();
    //buffer
    expect(PROOF_BUFFER(dt.toBuffer(BUF_4_7), hex4_7)).toBe(true);
    expect(() => {
        dt.toBuffer(Buffer.alloc(5));
    }).toThrow();
    expect(() => {
        dt.toBuffer(Buffer.alloc(3));
    }).toThrow();
    //buffer[]
    expect(() => {
        dt.toBuffer([BUF_4_7, BUF_4_7, BUF_4_7]);
    }).toThrow();
    expect(() => {
        dt.toBuffer([BUF_4_7, BUF_4_7, Buffer.alloc(3)]);
    }).toThrow();
    expect(() => {
        dt.toBuffer([BUF_4_7, BUF_4_7, Buffer.alloc(5)]);
    }).toThrow();
}

function testFromBuffer(
    dt: FloatDataType,
    hex4_7: string,
    hex4_7_BE: string,
    hex1156: string,
    hex1156_BE: string,
    hexM1156: string,
    hexM1156_BE: string
) {
    const BUF_4_7 = hexBuf(hex4_7);
    const BUF_4_7_BE = hexBuf(hex4_7_BE);
    const BUF_1156 = hexBuf(hex1156);
    const BUF_1156_BE = hexBuf(hex1156_BE);
    const BUF_M1156 = hexBuf(hexM1156);
    const BUF_M1156_BE = hexBuf(hexM1156_BE);

    expect(dt.fromBuffer(BUF_4_7)).toBeCloseTo(4.7);
    expect(() => {
        dt.fromBuffer(hexBuf("10" + hex4_7));
    }).toThrow();
    expect(dt.fromBuffer(BUF_4_7_BE, false)).toBeCloseTo(4.7);
    expect(() => {
        dt.fromBuffer(hexBuf("10" + hex4_7_BE), false);
    }).toThrow();
    expect(dt.fromBuffer(BUF_M1156)).toBeCloseTo(-1156);
    expect(() => {
        dt.fromBuffer(hexBuf("10" + hexM1156));
    }).toThrow();
    expect(dt.fromBuffer(BUF_M1156_BE, false)).toBeCloseTo(-1156);
    expect(() => {
        dt.fromBuffer(hexBuf("10" + hexM1156_BE), false);
    }).toThrow();
}

function testToString(dt: FloatDataType, hex4_7: string, hex1156: string) {
    const BUF_4_7 = hexBuf(hex4_7);
    const BUF_1156 = hexBuf(hex1156);

    expect(dt.toString(4.7)).toBe("4.7");
    expect(dt.toString(4.7, false)).toBe("4.7");

    expect(dt.toString(1156n)).toBe("1156");
    expect(dt.toString(1156n, false)).toBe("1156");

    expect(dt.toString("4.7")).toBe("4.7");
    expect(dt.toString("4.7", false)).toBe("4.7");

    expect(() => {
        dt.toString([4.7, 10, 10, -10]);
    }).toThrow();
    expect(() => {
        dt.toString([4.7, 10, 10, -10], false);
    }).toThrow();

    expect(() => {
        dt.toString([1156n, -1156n, 10n, 10n]);
    }).toThrow();
    expect(() => {
        dt.toString([1156n, -1156n, 10n, 10n], false);
    }).toThrow();
    expect(() => {
        dt.toString(["4.7", "1156", "10", "10"]);
    }).toThrow();
    expect(() => {
        dt.toString(["4.7", "1156", "10", "10"], false);
    }).toThrow();
    expect(() => {
        dt.toString([BUF_4_7, BUF_1156, hexBuf("0A"), hexBuf("0A")]);
    }).toThrow();
    expect(() => {
        dt.toString([BUF_4_7, BUF_1156, hexBuf("0A"), hexBuf("0A")], false);
    }).toThrow();
    expect(() => {
        dt.toString(<any>[4.7, 1156n, "4.7", BUF_4_7]);
    }).toThrow();
    expect(() => {
        dt.toString(<any>[4.7, 1156n, "4.7", BUF_4_7], false);
    }).toThrow();

    expect(parseFloat(dt.toString(BUF_4_7))).toBeCloseTo(4.7);

    expect(() => {
        dt.toString(hexBuf("10" + hex4_7));
    }).toThrow();
    expect(() => {
        dt.toString(hexBuf("10" + hex4_7), false);
    }).toThrow();
    expect(() => {
        dt.toString(NaN);
    }).toThrow();
    expect(() => {
        dt.toString(NaN, false);
    }).toThrow();
    expect(() => {
        dt.toString(Infinity);
    }).toThrow();
    expect(() => {
        dt.toString(Infinity, false);
    }).toThrow();
    expect(() => {
        dt.toString(-Infinity);
    }).toThrow();
    expect(() => {
        dt.toString(-Infinity, false);
    }).toThrow();
    expect(() => {
        dt.toString("no number");
    }).toThrow();
    expect(() => {
        dt.toString("no number", false);
    }).toThrow();
}

function testFromString(dt: FloatDataType) {
    expect(dt.fromString("4.7")).toBeCloseTo(4.7);
    expect(dt.fromString("1156")).toBeCloseTo(1156);
    expect(() => {
        dt.fromString("no number");
    }).toThrow();
}

test("FLOAT check", () => {
    testCheck(dtFloat, hexBuf(X_4_7), hexBuf(X_4_7_BE));
});

test("DOUBLE check", () => {
    testCheck(dtDouble, hexBuf(X_DB_4_7), hexBuf(X_DB_4_7_BE));
});

test("FLOAT validate", () => {
    testValidate(dtFloat, hexBuf(X_4_7), hexBuf(X_4_7_BE));
});

test("DOUBLE validate", () => {
    testValidate(dtDouble, hexBuf(X_DB_4_7), hexBuf(X_DB_4_7_BE));
});

test("FLOAT toBuffer", () => {
    testToBuffer(
        dtFloat,
        X_4_7,
        X_4_7_BE,
        X_1156,
        X_1156_BE,
        X_M1156,
        X_M1156_BE
    );
});

test("DOUBLE toBuffer", () => {
    testToBuffer(
        dtDouble,
        X_DB_4_7,
        X_DB_4_7_BE,
        X_DB_1156,
        X_DB_1156_BE,
        X_DB_M1156,
        X_DB_M1156_BE
    );
});

test("FLOAT fromBuffer", () => {
    testFromBuffer(
        dtFloat,
        X_4_7,
        X_4_7_BE,
        X_1156,
        X_1156_BE,
        X_M1156,
        X_M1156_BE
    );
});

test("DOUBLE fromBuffer", () => {
    testFromBuffer(
        dtDouble,
        X_DB_4_7,
        X_DB_4_7_BE,
        X_DB_1156,
        X_DB_1156_BE,
        X_DB_M1156,
        X_DB_M1156_BE
    );
});

test("FLOAT toString", () => {
    testToString(dtFloat, X_4_7, X_1156);
});

test("DOUBLE toString", () => {
    testToString(dtDouble, X_DB_4_7, X_DB_1156);
});

test("FLOAT fromString", () => {
    testFromString(dtFloat);
});

test("DOUBLE fromString", () => {
    testFromString(dtDouble);
});
