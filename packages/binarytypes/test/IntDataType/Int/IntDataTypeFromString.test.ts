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

    expect(dt.fromString(S_MAX)).toBe(MAX);
    expect(dt.fromString(S_MIN)).toBe(MIN);

    expect(dt.fromString(`${S_MAX}.3`)).toBe(MAX);
    expect(dt.fromString(`${S_MIN}.3`)).toBe(MIN);

    expect(() => {
        dt.fromString("no number");
    }).toThrow();
}

test("Validation INT8", () => {
    const dt = new IntDataType(1, true);
    testDt(dt, 127n, -128n, "7F", "80", "7F", "80");
});

test("Validation INT16", () => {
    const dt = new IntDataType(2, true);
    testDt(dt, 32767n, -32768n, "FF7F", "0080", "7FFF", "8000");
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
});

test("Validation UINT8", () => {
    const dt = new IntDataType(1, false);
    testDt(dt, 255n, 0n, "FF", "00", "FF", "00");
});

test("Validation UINT16", () => {
    const dt = new IntDataType(2, false);
    testDt(dt, 65535n, 0n, "FFFF", "0000", "FFFF", "0000");
});

test("Validation UINT32", () => {
    const dt = new IntDataType(4, false);
    testDt(dt, 4294967295n, 0n, "FFFFFFFF", "00000000", "FFFFFFFF", "00000000");
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
});
