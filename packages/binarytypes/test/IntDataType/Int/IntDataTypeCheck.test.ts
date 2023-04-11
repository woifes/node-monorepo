// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { IntDataType } from "../../../src/IntDataType";

function hexBuf(hex: string) {
    return Buffer.from(hex, "hex");
}

function testDt(
    dt: IntDataType,
    max: bigint,
    min: bigint,
    hexMax: string,
    hexMin: string,
    hexMaxBE: string,
    hexMinBE: string,
) {
    //#region defines
    const MAX = max < Number.MAX_SAFE_INTEGER ? Number(max) : max;
    const MIN = max < Number.MAX_SAFE_INTEGER ? Number(min) : min;
    const X_MAX = hexMax;
    const X_MIN = hexMin;
    const X_MAX_BE = hexMaxBE;
    const X_MIN_BE = hexMinBE;
    const BI_MAX = max;
    const BI_MIN = min;
    const S_MAX = `${BI_MAX}`;
    const S_MIN = `${BI_MIN}`;
    const BUF_MAX = hexBuf(X_MAX);
    const BUF_MIN = hexBuf(X_MIN);
    const BUF_MAX_BE = hexBuf(X_MAX_BE);
    const BUF_MIN_BE = hexBuf(X_MIN_BE);
    //#endregion

    if (typeof MAX === "number") {
        expect(dt.check(MAX)).toBe(MAX);
        expect(dt.check(MIN)).toBe(MIN);
        expect(() => {
            dt.check(MAX + 1);
        }).toThrow();
        expect(() => {
            dt.check((MIN as number) - 1);
        }).toThrow();
        //float
        expect(dt.check(MAX + 0.3)).toBe(MAX);
        expect(dt.check((MIN as number) - 0.3)).toBe(MIN);
        expect(() => {
            dt.check(MAX + 1.3);
        }).toThrow();
        expect(() => {
            dt.check((MIN as number) - 1.3);
        }).toThrow();
    }
    //bigint
    expect(dt.check(BI_MAX)).toBe(MAX);
    expect(dt.check(BI_MIN)).toBe(MIN);
    expect(() => {
        dt.check(BI_MAX + 1n);
    }).toThrow();
    expect(() => {
        dt.check(BI_MIN - 1n);
    }).toThrow();
    //string
    expect(dt.check(S_MAX)).toBe(MAX);
    expect(dt.check(S_MIN)).toBe(MIN);
    expect(() => {
        dt.check(`${BI_MAX + 1n}`);
    }).toThrow();
    expect(() => {
        dt.check(`${BI_MIN - 1n}`);
    }).toThrow();
    //string with float
    expect(dt.check(`${S_MAX}.3`)).toBe(MAX);
    expect(dt.check(`${S_MIN}.3`)).toBe(MIN);
    expect(() => {
        dt.check(`${BI_MAX + 1n}.3`);
    }).toThrow();
    expect(() => {
        dt.check(`${BI_MIN - 1n}.3`);
    }).toThrow();

    if (typeof MAX === "number" && typeof MIN === "number") {
        expect(() => {
            dt.check([MAX, MIN, 10, -10]);
        }).toThrow();
        expect(() => {
            dt.check([MAX + 0.3, MIN + 0.3, 10, -10]);
        }).toThrow(); //float
    }
    expect(() => {
        dt.check([BI_MAX, BI_MIN, 10n, 10n]);
    }).toThrow();
    expect(() => {
        dt.check([S_MAX, S_MIN, "10", "10"]);
    }).toThrow();
    expect(() => {
        dt.check([`${S_MAX}.3`, S_MIN, "10", "10"]);
    }).toThrow();
    expect(() => {
        dt.check([BUF_MAX, BUF_MIN, hexBuf("0A"), hexBuf("0A")]);
    }).toThrow();
    expect(() => {
        dt.check(<any>[MAX, BI_MAX, S_MAX, BUF_MAX]);
    }).toThrow();

    expect(dt.check(BUF_MAX)).toBe(MAX);
    expect(dt.check(BUF_MIN)).toBe(MIN);
    expect(() => {
        dt.check(hexBuf(`10${S_MAX}`));
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
    expect(() => {
        dt.check("no number");
    }).toThrow();
}

test("Validation INT8", () => {
    const dt = new IntDataType(1, true);
    testDt(dt, 127n, -128n, "7F", "80", "7F", "80");
    expect(dt.check(hexBuf("12"))).toBe(18);
    expect(dt.check(hexBuf("12"), false)).toBe(18);
});

test("Validation INT16", () => {
    const dt = new IntDataType(2, true);
    testDt(dt, 32767n, -32768n, "FF7F", "0080", "7FFF", "8000");
    expect(dt.check(hexBuf("1234"))).toBe(13330);
    expect(dt.check(hexBuf("3412"), false)).toBe(13330);
});

test("Validation INT32", () => {
    const dt = new IntDataType(4, true);
    testDt(
        dt,
        2147483647n,
        -2147483648n,
        "FFFFFF7F",
        "00000080",
        "7FFFFFFF",
        "80000000",
    );
    expect(dt.check(hexBuf("12345678"))).toBe(2018915346);
    expect(dt.check(hexBuf("78563412"), false)).toBe(2018915346);
});

test("Validation INT64", () => {
    const dt = new IntDataType(8, true);
    testDt(
        dt,
        9223372036854775807n,
        -9223372036854775808n,
        "FFFFFFFFFFFFFF7F",
        "0000000000000080",
        "7FFFFFFFFFFFFFFF",
        "8000000000000000",
    );

    expect(dt.check(123)).toBe(123n);
    expect(dt.check(-123)).toBe(-123n);
    expect(() => {
        dt.check(Number.MAX_SAFE_INTEGER);
    }).not.toThrow();
    expect(() => {
        dt.check(Number.MAX_SAFE_INTEGER + 1);
    }).toThrow();
    expect(() => {
        dt.check(Number.MIN_SAFE_INTEGER);
    }).not.toThrow();
    expect(() => {
        dt.check(Number.MIN_SAFE_INTEGER - 1);
    }).toThrow();

    expect(dt.check(hexBuf("1234567890ABCDEF"))).toBe(-1167088091436534766n);
    expect(dt.check(hexBuf("EFCDAB9078563412"), false)).toBe(
        -1167088091436534766n,
    );
});

test("Validation UINT8", () => {
    const dt = new IntDataType(1, false);
    testDt(dt, 255n, 0n, "FF", "00", "FF", "00");
    expect(dt.check(hexBuf("12"))).toBe(18);
    expect(dt.check(hexBuf("12"), false)).toBe(18);
});

test("Validation UINT16", () => {
    const dt = new IntDataType(2, false);
    testDt(dt, 65535n, 0n, "FFFF", "0000", "FFFF", "0000");
    expect(dt.check(hexBuf("1234"))).toBe(13330);
    expect(dt.check(hexBuf("3412"), false)).toBe(13330);
});

test("Validation UINT32", () => {
    const dt = new IntDataType(4, false);
    testDt(dt, 4294967295n, 0n, "FFFFFFFF", "00000000", "FFFFFFFF", "00000000");
    expect(dt.check(hexBuf("12345678"))).toBe(2018915346);
    expect(dt.check(hexBuf("78563412"), false)).toBe(2018915346);
});

test("Validation UINT64", () => {
    const dt = new IntDataType(8, false);
    testDt(
        dt,
        18446744073709551615n,
        0n,
        "FFFFFFFFFFFFFFFF",
        "0000000000000000",
        "FFFFFFFFFFFFFFFF",
        "0000000000000000",
    );
    expect(dt.check(hexBuf("1234567890ABCDEF"))).toBe(17279655982273016850n);
    expect(dt.check(hexBuf("EFCDAB9078563412"), false)).toBe(
        17279655982273016850n,
    );

    expect(dt.check(123)).toBe(123n);
    expect(dt.check(0)).toBe(0n);
    expect(() => {
        dt.check(Number.MAX_SAFE_INTEGER);
    }).not.toThrow();
    expect(() => {
        dt.check(Number.MAX_SAFE_INTEGER + 1);
    }).toThrow();
    expect(() => {
        dt.check(-1);
    }).toThrow();
});
