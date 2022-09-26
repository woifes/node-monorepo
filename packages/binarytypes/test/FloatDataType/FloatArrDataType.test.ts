// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { FloatArrDataType } from "../../src/FloatArrDataType";

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

const dtFloat = new FloatArrDataType(4);
const dtDouble = new FloatArrDataType(8);

function testCheck(
    dt: FloatArrDataType,
    BUF_4_7: Buffer,
    BUF_4_7_BE: Buffer,
    HEX_4_7: string,
    HEX_4_7_BE: string
) {
    //number
    expect(() => {
        dt.check(3.4);
    }).toThrow();
    expect(() => {
        dt.check(-3.4);
    }).toThrow();
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
    expect(dt.check('["1.1", "2.2", "3.3"]')).toEqual([1.1, 2.2, 3.3]);
    expect(() => {
        dt.check("3.4");
    }).toThrow();
    expect(() => {
        dt.check("-3.4");
    }).toThrow();
    expect(() => {
        dt.check("no number");
    }).toThrow();
    //bigint
    expect(() => {
        dt.check(11111n);
    }).toThrow();
    expect(() => {
        dt.check(-12345n);
    }).toThrow();
    //number[]
    expect(dt.check([1, 2, 3])).toEqual([1, 2, 3]);
    //string[]
    expect(dt.check(["1.1", "2.2", "3.3"])).toEqual([1.1, 2.2, 3.3]);
    expect(() => {
        dt.check(["1", "no number", "3"]);
    }).toThrow();
    //bigint[]
    expect(dt.check([1n, 2n, 3n])).toEqual([1, 2, 3]);
    //buffer
    expect(
        (dt.check(hexBuf(HEX_4_7 + HEX_4_7 + HEX_4_7)) as number[])[0]
    ).toBeCloseTo(4.7);
    expect(
        (dt.check(hexBuf(HEX_4_7 + HEX_4_7 + HEX_4_7)) as number[])[1]
    ).toBeCloseTo(4.7);
    expect(
        (dt.check(hexBuf(HEX_4_7 + HEX_4_7 + HEX_4_7)) as number[])[2]
    ).toBeCloseTo(4.7);
    expect(
        (
            dt.check(
                hexBuf(HEX_4_7_BE + HEX_4_7_BE + HEX_4_7_BE),
                false
            ) as number[]
        )[0]
    ).toBeCloseTo(4.7);
    expect(
        (
            dt.check(
                hexBuf(HEX_4_7_BE + HEX_4_7_BE + HEX_4_7_BE),
                false
            ) as number[]
        )[1]
    ).toBeCloseTo(4.7);
    expect(
        (
            dt.check(
                hexBuf(HEX_4_7_BE + HEX_4_7_BE + HEX_4_7_BE),
                false
            ) as number[]
        )[2]
    ).toBeCloseTo(4.7);
    expect(() => {
        dt.check(Buffer.alloc(5));
    }).toThrow();
    expect(() => {
        dt.check(Buffer.alloc(3));
    }).toThrow();
    //buffer[]
    const res: number[] = <number[]>dt.check([BUF_4_7, BUF_4_7, BUF_4_7]);
    expect(res[0]).toBeCloseTo(4.7);
    expect(res[1]).toBeCloseTo(4.7);
    expect(res[2]).toBeCloseTo(4.7);
    expect(() => {
        dt.check([BUF_4_7, BUF_4_7, Buffer.alloc(BUF_4_7.length + 1)]);
    }).toThrow();
    expect(() => {
        dt.check([BUF_4_7, BUF_4_7, Buffer.alloc(BUF_4_7.length + -1)]);
    }).toThrow();
}

function testValidate(
    dt: FloatArrDataType,
    BUF_4_7: Buffer,
    BUF_4_7_BE: Buffer
) {
    //number
    expect(dt.validate(3.4)).toBe(false);
    expect(dt.validate(-3.4)).toBe(false);
    expect(dt.validate(NaN)).toBe(false);
    expect(dt.validate(Infinity)).toBe(false);
    expect(dt.validate(-Infinity)).toBe(false);
    //string
    expect(dt.validate('["1", "2", "3"]')).toBe(true);
    expect(dt.validate("3.4")).toBe(false);
    expect(dt.validate("-3.4")).toBe(false);
    expect(dt.validate("no number")).toBe(false);
    //bigint
    expect(dt.validate(11111n)).toBe(false);
    expect(dt.validate(-12345n)).toBe(false);
    //number[]
    expect(dt.validate([1, 2, 3])).toBe(true);
    //string[]
    expect(dt.validate(["1", "2", "3"])).toBe(true);
    expect(dt.validate(["1", "no number", "3"])).toBe(false);
    //bigint[]
    expect(dt.validate([1n, 2n, 3n])).toBe(true);
    //buffer
    expect(dt.validate(BUF_4_7)).toBe(true);
    expect(dt.validate(Buffer.alloc(5))).toBe(false);
    expect(dt.validate(Buffer.alloc(3))).toBe(false);
    //buffer[]
    expect(dt.validate([BUF_4_7, BUF_4_7, BUF_4_7])).toBe(true);
    expect(dt.validate([BUF_4_7, BUF_4_7, Buffer.alloc(3)])).toBe(false);
    expect(dt.validate([BUF_4_7, BUF_4_7, Buffer.alloc(5)])).toBe(false);
}

function testToBuffer(
    dt: FloatArrDataType,
    hex4_7: string,
    hex4_7_BE: string,
    hex1156: string,
    hex1156_BE: string,
    hexM1156: string,
    hexM1156_BE: string
) {
    const BUF_4_7 = hexBuf(hex4_7);
    //number
    expect(() => {
        dt.toBuffer(4.7);
    }).toThrow();
    expect(() => {
        dt.toBuffer(4.7, false);
    }).toThrow();
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
    expect(
        PROOF_BUFFER(
            dt.toBuffer('["4.7", "4.7", "4.7"]'),
            hex4_7 + hex4_7 + hex4_7
        )
    ).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer('["4.7", "4.7", "4.7"]', false),
            hex4_7_BE + hex4_7_BE + hex4_7_BE
        )
    ).toBe(true);
    expect(() => {
        dt.toBuffer("4.7");
    }).toThrow();
    expect(() => {
        dt.toBuffer("4.7", false);
    }).toThrow();
    expect(() => {
        dt.toBuffer("no number");
    }).toThrow();
    //bigint
    expect(() => {
        dt.toBuffer(1156n);
    }).toThrow();
    expect(() => {
        dt.toBuffer(-1156n);
    }).toThrow();
    expect(() => {
        dt.toBuffer(1156n, false);
    }).toThrow();
    expect(() => {
        dt.toBuffer(-1156n, false);
    }).toThrow();
    //number[]
    expect(
        PROOF_BUFFER(dt.toBuffer([4.7, 4.7, 4.7]), hex4_7 + hex4_7 + hex4_7)
    ).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer([4.7, 4.7, 4.7], false),
            hex4_7_BE + hex4_7_BE + hex4_7_BE
        )
    ).toBe(true);
    //string[]
    expect(
        PROOF_BUFFER(
            dt.toBuffer(["4.7", "4.7", "4.7"]),
            hex4_7 + hex4_7 + hex4_7
        )
    ).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer(["4.7", "4.7", "4.7"], false),
            hex4_7_BE + hex4_7_BE + hex4_7_BE
        )
    ).toBe(true);
    expect(() => {
        dt.toBuffer(["1", "no number", "3"]);
    }).toThrow();
    //bigint[]
    expect(
        PROOF_BUFFER(
            dt.toBuffer([1156n, 1156n, -1156n]),
            hex1156 + hex1156 + hexM1156
        )
    ).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer([1156n, 1156n, -1156n], false),
            hex1156_BE + hex1156_BE + hexM1156_BE
        )
    ).toBe(true);
    //buffer
    expect(PROOF_BUFFER(dt.toBuffer(BUF_4_7), hex4_7)).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer(hexBuf(hex4_7 + hex4_7 + hex4_7)),
            hex4_7 + hex4_7 + hex4_7
        )
    ).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer(hexBuf(hex4_7_BE + hex4_7_BE + hex4_7_BE), false),
            hex4_7_BE + hex4_7_BE + hex4_7_BE
        )
    ).toBe(true);
    expect(() => {
        dt.toBuffer(Buffer.alloc(5));
    }).toThrow();
    expect(() => {
        dt.toBuffer(Buffer.alloc(3));
    }).toThrow();
    //buffer[]
    expect(
        PROOF_BUFFER(
            dt.toBuffer([BUF_4_7, BUF_4_7, BUF_4_7]),
            hex4_7 + hex4_7 + hex4_7
        )
    ).toBe(true);
    expect(() => {
        dt.toBuffer([BUF_4_7, BUF_4_7, Buffer.alloc(3)]);
    }).toThrow();
    expect(() => {
        dt.toBuffer([BUF_4_7, BUF_4_7, Buffer.alloc(5)]);
    }).toThrow();

    expect(() => {
        dt.toBuffer([NaN, 4.7, 4.7]);
    }).toThrow();
    expect(() => {
        dt.toBuffer([4.7, Infinity, 4.7]);
    }).toThrow();
    expect(() => {
        dt.toBuffer([4.7, 4.7, -Infinity]);
    }).toThrow();
    expect(() => {
        dt.toBuffer(<any>[4.7, 4.7, "no number"]);
    }).toThrow();
}

function testFromBuffer(
    dt: FloatArrDataType,
    hex4_7: string,
    hex4_7_BE: string,
    hex1156: string,
    hex1156_BE: string,
    hexM1156: string,
    hexM1156_BE: string
) {
    const BUF_1 = hexBuf(hex4_7 + hex1156 + hexM1156);
    const BUF_1_ERR = hexBuf(hex4_7 + hex1156 + hexM1156 + "10");
    const BUF_1_BE = hexBuf(hex4_7_BE + hex1156_BE + hexM1156_BE);
    const BUF_1_BE_ERR = hexBuf(hex4_7_BE + hex1156_BE + hexM1156_BE + "10");

    let res: number[];

    res = dt.fromBuffer(BUF_1) as number[];
    expect(res[0]).toBeCloseTo(4.7);
    expect(res[1]).toBeCloseTo(1156);
    expect(res[2]).toBeCloseTo(-1156);

    res = dt.fromBuffer(BUF_1_BE, false) as number[];
    expect(res[0]).toBeCloseTo(4.7);
    expect(res[1]).toBeCloseTo(1156);
    expect(res[2]).toBeCloseTo(-1156);

    expect(() => {
        dt.fromBuffer(BUF_1_ERR);
    }).toThrow();
    expect(() => {
        dt.fromBuffer(BUF_1_BE_ERR, false);
    }).toThrow();
}

function testToString(
    dt: FloatArrDataType,
    hex4_7: string,
    hex1156: string,
    hex4_7_BE: string,
    hex1156_BE: string
) {
    const BUF_4_7 = hexBuf(hex4_7);
    const BUF_1156 = hexBuf(hex1156);
    const BUF_4_7_BE = hexBuf(hex4_7_BE);
    const BUF_1156_BE = hexBuf(hex1156_BE);

    expect(() => {
        dt.toString(4.7);
    }).toThrow();
    expect(() => {
        dt.toString(4.7, false);
    }).toThrow();

    expect(() => {
        dt.toString(1156n);
    }).toThrow();
    expect(() => {
        dt.toString(1156n, false);
    }).toThrow();

    expect(() => {
        dt.toString("4.7");
    }).toThrow();
    expect(() => {
        dt.toString("4.7", false);
    }).toThrow();

    expect(dt.toString([4.7, 10, 10, -10])).toEqual("[4.7,10,10,-10]");
    expect(dt.toString([4.7, 10, 10, -10], false)).toEqual("[4.7,10,10,-10]");

    expect(dt.toString([1156n, -1156n, 10n, 10n])).toEqual(
        "[1156,-1156,10,10]"
    );
    expect(dt.toString([1156n, -1156n, 10n, 10n], false)).toEqual(
        "[1156,-1156,10,10]"
    );
    expect(dt.toString(["4.7", "1156", "10", "10"])).toEqual(
        "[4.7,1156,10,10]"
    );
    expect(dt.toString(["4.7", "1156", "10", "10"], false)).toEqual(
        "[4.7,1156,10,10]"
    );

    let res: number[] = JSON.parse(
        dt.toString([BUF_4_7, BUF_1156, BUF_4_7, BUF_1156])
    );
    expect(res[0]).toBeCloseTo(4.7);
    expect(res[1]).toBeCloseTo(1156);
    expect(res[2]).toBeCloseTo(4.7);
    expect(res[3]).toBeCloseTo(1156);

    res = JSON.parse(
        dt.toString([BUF_4_7_BE, BUF_1156_BE, BUF_4_7_BE, BUF_1156_BE], false)
    );
    expect(res[0]).toBeCloseTo(4.7);
    expect(res[1]).toBeCloseTo(1156);
    expect(res[2]).toBeCloseTo(4.7);
    expect(res[3]).toBeCloseTo(1156);

    res = JSON.parse(dt.toString(<any>[4.7, 1156n, "4.7", BUF_4_7]));
    expect(res[0]).toBeCloseTo(4.7);
    expect(res[1]).toBeCloseTo(1156);
    expect(res[2]).toBeCloseTo(4.7);
    expect(res[3]).toBeCloseTo(4.7);

    res = JSON.parse(dt.toString(<any>[4.7, 1156n, "4.7", BUF_4_7_BE], false));
    expect(res[0]).toBeCloseTo(4.7);
    expect(res[1]).toBeCloseTo(1156);
    expect(res[2]).toBeCloseTo(4.7);
    expect(res[3]).toBeCloseTo(4.7);

    expect(() => {
        dt.toString([BUF_4_7, BUF_1156, hexBuf("0A"), hexBuf("0A")]);
    }).toThrow();
    expect(() => {
        dt.toString([BUF_4_7, BUF_1156, hexBuf("0A"), hexBuf("0A")], false);
    }).toThrow();
    //wrong number
    expect(() => {
        dt.toString([NaN, 10, 10, -10]);
    }).toThrow();
    expect(() => {
        dt.toString([4.7, Infinity, 10, -10]);
    }).toThrow();
    expect(() => {
        dt.toString([4.7, 10, -Infinity, -10]);
    }).toThrow();
    expect(() => {
        dt.toString(<any>[4.7, 10, 10, "no number"]);
    }).toThrow();

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

function testFromString(dt: FloatArrDataType) {
    expect(dt.fromString("[1, 2, 3]")).toEqual([1, 2, 3]);
    const res: number[] = <number[]>dt.fromString("[4.7, -17.8, 129.37]");
    expect(res[0]).toBeCloseTo(4.7);
    expect(res[1]).toBeCloseTo(-17.8);
    expect(res[2]).toBeCloseTo(129.37);
    expect(() => {
        dt.fromString("1156");
    }).toThrow();
    expect(() => {
        dt.fromString("no number");
    }).toThrow();
}

test("FLOAT check", () => {
    testCheck(dtFloat, hexBuf(X_4_7), hexBuf(X_4_7_BE), X_4_7, X_4_7_BE);
});

test("DOUBLE check", () => {
    testCheck(
        dtDouble,
        hexBuf(X_DB_4_7),
        hexBuf(X_DB_4_7_BE),
        X_DB_4_7,
        X_DB_4_7_BE
    );
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
    testToString(dtFloat, X_4_7, X_1156, X_4_7_BE, X_1156_BE);
});

test("DOUBLE toString", () => {
    testToString(dtDouble, X_DB_4_7, X_DB_1156, X_DB_4_7_BE, X_DB_1156_BE);
});

test("FLOAT fromString", () => {
    testFromString(dtFloat);
});

test("DOUBLE fromString", () => {
    testFromString(dtDouble);
});
