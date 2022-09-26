// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { IntDataType } from "../../../src/IntDataType";

function PROOF_BUFFER(buf: Buffer, hexVal: string) {
    return buf.equals(Buffer.from(hexVal, "hex"));
}

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
    hexMinBE: string
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

    if (typeof MAX == "number") {
        expect(dt.toString(MAX)).toBe(S_MAX);
        expect(dt.toString(MIN)).toBe(S_MIN);
        expect(dt.toString(MAX, false)).toBe(S_MAX);
        expect(dt.toString(MIN, false)).toBe(S_MIN);
        expect(() => {
            dt.toString(MAX + 1);
        }).toThrow();
        expect(() => {
            dt.toString(<any>MIN - 1);
        }).toThrow();
        expect(() => {
            dt.toString(MAX + 1, false);
        }).toThrow();
        expect(() => {
            dt.toString(<any>MIN - 1, false);
        }).toThrow();
        //float
        expect(dt.toString(MAX + 0.3)).toBe(S_MAX);
        expect(dt.toString(<any>MIN - 0.3)).toBe(S_MIN);
        expect(dt.toString(MAX + 0.3, false)).toBe(S_MAX);
        expect(dt.toString(<any>MIN - 0.3, false)).toBe(S_MIN);
        expect(() => {
            dt.toString(MAX + 1.3);
        }).toThrow();
        expect(() => {
            dt.toString(<any>MIN - 1.3);
        }).toThrow();
        expect(() => {
            dt.toString(MAX + 1.3, false);
        }).toThrow();
        expect(() => {
            dt.toString(<any>MIN - 1.3, false);
        }).toThrow();
    }
    //bigint
    expect(dt.toString(BI_MAX)).toBe(S_MAX);
    expect(dt.toString(BI_MIN)).toBe(S_MIN);
    expect(dt.toString(BI_MAX, false)).toBe(S_MAX);
    expect(dt.toString(BI_MIN, false)).toBe(S_MIN);
    expect(() => {
        dt.toString(BI_MAX + 1n);
    }).toThrow();
    expect(() => {
        dt.toString(BI_MIN - 1n);
    }).toThrow();
    expect(() => {
        dt.toString(BI_MAX + 1n, false);
    }).toThrow();
    expect(() => {
        dt.toString(BI_MIN - 1n, false);
    }).toThrow();
    //string integer
    expect(dt.toString(S_MAX)).toBe(S_MAX);
    expect(dt.toString(S_MIN)).toBe(S_MIN);
    expect(dt.toString(S_MAX, false)).toBe(S_MAX);
    expect(dt.toString(S_MIN, false)).toBe(S_MIN);
    expect(() => {
        dt.toString(`${BI_MAX + 1n}`);
    }).toThrow();
    expect(() => {
        dt.toString(`${BI_MIN - 1n}`);
    }).toThrow();
    expect(() => {
        dt.toString(`${BI_MAX + 1n}`, false);
    }).toThrow();
    expect(() => {
        dt.toString(`${BI_MIN - 1n}`, false);
    }).toThrow();
    //string float
    expect(dt.toString(S_MAX + ".3")).toBe(S_MAX);
    expect(dt.toString(S_MIN + ".3")).toBe(S_MIN);
    expect(dt.toString(S_MAX + ".3", false)).toBe(S_MAX);
    expect(dt.toString(S_MIN + ".3", false)).toBe(S_MIN);
    expect(() => {
        dt.toString(`${BI_MAX + 1n}.3`);
    }).toThrow();
    expect(() => {
        dt.toString(`${BI_MIN - 1n}.3`);
    }).toThrow();
    expect(() => {
        dt.toString(`${BI_MAX + 1n}.3`, false);
    }).toThrow();
    expect(() => {
        dt.toString(`${BI_MIN - 1n}.3`, false);
    }).toThrow();

    if (typeof MAX == "number" && typeof MIN == "number") {
        expect(() => {
            dt.toString([MAX, MIN, 10, -10]);
        }).toThrow();
        expect(() => {
            dt.toString([MAX, MIN, 10, -10], false);
        }).toThrow();

        expect(() => {
            dt.toString([MAX + 0.3, MIN, 10, -10]);
        }).toThrow();
        expect(() => {
            dt.toString([MAX + 0.3, MIN, 10, -10], false);
        }).toThrow();
    }
    expect(() => {
        dt.toString([BI_MAX, BI_MIN, 10n, 10n]);
    }).toThrow();
    expect(() => {
        dt.toString([BI_MAX, BI_MIN, 10n, 10n], false);
    }).toThrow();
    expect(() => {
        dt.toString([S_MAX, S_MIN, "10", "10"]);
    }).toThrow();
    expect(() => {
        dt.toString([S_MAX, S_MIN, "10", "10"], false);
    }).toThrow();
    expect(() => {
        dt.toString([BUF_MAX, BUF_MIN, hexBuf("0A"), hexBuf("0A")]);
    }).toThrow();
    expect(() => {
        dt.toString([BUF_MAX, BUF_MIN, hexBuf("0A"), hexBuf("0A")], false);
    }).toThrow();
    expect(() => {
        dt.toString(<any>[MAX, BI_MAX, S_MAX, BUF_MAX]);
    }).toThrow();
    expect(() => {
        dt.toString(<any>[MAX, BI_MAX, S_MAX, BUF_MAX], false);
    }).toThrow();

    expect(dt.toString(BUF_MAX)).toBe(S_MAX);
    expect(dt.toString(BUF_MIN)).toBe(S_MIN);

    expect(() => {
        dt.toString(hexBuf("10" + S_MAX));
    }).toThrow();
    expect(() => {
        dt.toString(hexBuf("10" + S_MAX), false);
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

test("Validation INT8", () => {
    const dt = new IntDataType(1, true);
    testDt(dt, 127n, -128n, "7F", "80", "7F", "80");

    expect(dt.toString(hexBuf("12"))).toBe("18");
    expect(dt.toString(hexBuf("12"), false)).toBe("18");
});

test("Validation INT16", () => {
    const dt = new IntDataType(2, true);
    testDt(dt, 32767n, -32768n, "FF7F", "0080", "7FFF", "8000");

    expect(dt.toString(hexBuf("1234"))).toBe("13330");
    expect(dt.toString(hexBuf("3412"), false)).toBe("13330");
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
        "80000000"
    );

    expect(dt.toString(hexBuf("12345678"))).toBe("2018915346");
    expect(dt.toString(hexBuf("78563412"), false)).toBe("2018915346");
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
        "8000000000000000"
    );

    expect(dt.toString(hexBuf("1234567890ABCDEF"))).toBe(
        "-1167088091436534766"
    );
    expect(dt.toString(hexBuf("EFCDAB9078563412"), false)).toBe(
        "-1167088091436534766"
    );
});

test("Validation UINT8", () => {
    const dt = new IntDataType(1, false);
    testDt(dt, 255n, 0n, "FF", "00", "FF", "00");

    expect(dt.toString(hexBuf("12"))).toBe("18");
    expect(dt.toString(hexBuf("12"), false)).toBe("18");
});

test("Validation UINT16", () => {
    const dt = new IntDataType(2, false);
    testDt(dt, 65535n, 0n, "FFFF", "0000", "FFFF", "0000");

    expect(dt.toString(hexBuf("1234"))).toBe("13330");
    expect(dt.toString(hexBuf("3412"), false)).toBe("13330");
});

test("Validation UINT32", () => {
    const dt = new IntDataType(4, false);
    testDt(dt, 4294967295n, 0n, "FFFFFFFF", "00000000", "FFFFFFFF", "00000000");

    expect(dt.toString(hexBuf("12345678"))).toBe("2018915346");
    expect(dt.toString(hexBuf("78563412"), false)).toBe("2018915346");
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
        "0000000000000000"
    );

    expect(dt.toString(hexBuf("1234567890ABCDEF"))).toBe(
        "17279655982273016850"
    );
    expect(dt.toString(hexBuf("EFCDAB9078563412"), false)).toBe(
        "17279655982273016850"
    );
});
