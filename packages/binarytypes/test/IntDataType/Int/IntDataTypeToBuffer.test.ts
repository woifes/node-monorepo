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

    if (typeof MAX === "number") {
        expect(PROOF_BUFFER(dt.toBuffer(MAX), X_MAX)).toBe(true);
        expect(PROOF_BUFFER(dt.toBuffer(MIN), X_MIN)).toBe(true);
        expect(PROOF_BUFFER(dt.toBuffer(MAX, false), X_MAX_BE)).toBe(true);
        expect(PROOF_BUFFER(dt.toBuffer(MIN, false), X_MIN_BE)).toBe(true);
        expect(() => {
            dt.toBuffer(MAX + 1), X_MAX;
        }).toThrow();
        expect(() => {
            dt.toBuffer(<any>MIN - 1), X_MIN;
        }).toThrow();
        expect(() => {
            dt.toBuffer(MAX + 1, false), X_MAX_BE;
        }).toThrow();
        expect(() => {
            dt.toBuffer(<any>MIN - 1, false), X_MIN_BE;
        }).toThrow();
        //float
        expect(PROOF_BUFFER(dt.toBuffer(MAX + 0.3), X_MAX)).toBe(true);
        expect(PROOF_BUFFER(dt.toBuffer(<any>MIN - 0.3), X_MIN)).toBe(true);
        expect(PROOF_BUFFER(dt.toBuffer(MAX + 0.3, false), X_MAX_BE)).toBe(
            true,
        );
        expect(PROOF_BUFFER(dt.toBuffer(<any>MIN - 0.3, false), X_MIN_BE)).toBe(
            true,
        );
        expect(() => {
            dt.toBuffer(MAX + 1.3), X_MAX;
        }).toThrow();
        expect(() => {
            dt.toBuffer(<any>MIN - 1.3), X_MIN;
        }).toThrow();
        expect(() => {
            dt.toBuffer(MAX + 1.3, false), X_MAX_BE;
        }).toThrow();
        expect(() => {
            dt.toBuffer(<any>MIN - 1.3, false), X_MIN_BE;
        }).toThrow();
    }
    //bigint
    expect(PROOF_BUFFER(dt.toBuffer(BI_MAX), X_MAX)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(BI_MIN), X_MIN)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(BI_MAX, false), X_MAX_BE)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(BI_MIN, false), X_MIN_BE)).toBe(true);
    expect(() => {
        dt.toBuffer(BI_MAX + 1n), X_MAX;
    }).toThrow();
    expect(() => {
        dt.toBuffer(BI_MIN - 1n), X_MIN;
    }).toThrow();
    expect(() => {
        dt.toBuffer(BI_MAX + 1n, false), X_MAX_BE;
    }).toThrow();
    expect(() => {
        dt.toBuffer(BI_MIN - 1n, false), X_MIN_BE;
    }).toThrow();
    //string integer
    expect(PROOF_BUFFER(dt.toBuffer(S_MAX), X_MAX)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(S_MIN), X_MIN)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(S_MAX, false), X_MAX_BE)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(S_MIN, false), X_MIN_BE)).toBe(true);
    expect(() => {
        dt.toBuffer(`${BI_MAX + 1n}`), X_MAX;
    }).toThrow();
    expect(() => {
        dt.toBuffer(`${BI_MIN - 1n}`), X_MIN;
    }).toThrow();
    expect(() => {
        dt.toBuffer(`${BI_MAX + 1n}`, false), X_MAX_BE;
    }).toThrow();
    expect(() => {
        dt.toBuffer(`${BI_MIN - 1n}`, false), X_MIN_BE;
    }).toThrow();
    //string float
    expect(PROOF_BUFFER(dt.toBuffer(`${S_MAX}.3`), X_MAX)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(`${S_MIN}.3`), X_MIN)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(`${S_MAX}.3`, false), X_MAX_BE)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(`${S_MIN}.3`, false), X_MIN_BE)).toBe(true);
    expect(() => {
        dt.toBuffer(`${BI_MAX + 1n}.3`), X_MAX;
    }).toThrow();
    expect(() => {
        dt.toBuffer(`${BI_MIN - 1n}.3`), X_MIN;
    }).toThrow();
    expect(() => {
        dt.toBuffer(`${BI_MAX + 1n}.3`, false), X_MAX_BE;
    }).toThrow();
    expect(() => {
        dt.toBuffer(`${BI_MIN - 1n}.3`, false), X_MIN_BE;
    }).toThrow();

    if (typeof MAX === "number" && typeof MIN === "number") {
        expect(() => {
            dt.toBuffer([MAX, MIN, 10, -10]);
        }).toThrow();
        expect(() => {
            dt.toBuffer([MAX, MIN, 10, -10], false);
        }).toThrow();
        //float
        expect(() => {
            dt.toBuffer([MAX + 0.3, MIN, 10, -10]);
        }).toThrow();
        expect(() => {
            dt.toBuffer([MAX + 0.3, MIN, 10, -10], false);
        }).toThrow();
    }
    expect(() => {
        dt.toBuffer([BI_MAX, BI_MIN, 10n, 10n]);
    }).toThrow();
    expect(() => {
        dt.toBuffer([BI_MAX, BI_MIN, 10n, 10n], false);
    }).toThrow();
    expect(() => {
        dt.toBuffer([S_MAX, S_MIN, "10", "10"]);
    }).toThrow();
    expect(() => {
        dt.toBuffer([S_MAX, S_MIN, "10", "10"], false);
    }).toThrow();
    expect(() => {
        dt.toBuffer([BUF_MAX, BUF_MIN, hexBuf("0A"), hexBuf("0A")]);
    }).toThrow();
    expect(() => {
        dt.toBuffer([BUF_MAX, BUF_MIN, hexBuf("0A"), hexBuf("0A")], false);
    }).toThrow();
    expect(() => {
        dt.toBuffer(<any>[MAX, BI_MAX, S_MAX, BUF_MAX]);
    }).toThrow();
    expect(() => {
        dt.toBuffer(<any>[MAX, BI_MAX, S_MAX, BUF_MAX], false);
    }).toThrow();

    expect(PROOF_BUFFER(dt.toBuffer(BUF_MAX), X_MAX)).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(BUF_MIN), X_MIN)).toBe(true);
    //will not be retransformed

    expect(() => {
        dt.toBuffer(hexBuf(`10${S_MAX}`));
    }).toThrow();
    expect(() => {
        dt.toBuffer(hexBuf(`10${S_MAX}`), false);
    }).toThrow();
    expect(() => {
        dt.toBuffer(NaN);
    }).toThrow();
    expect(() => {
        dt.toBuffer(NaN, false);
    }).toThrow();
    expect(() => {
        dt.toBuffer(Infinity);
    }).toThrow();
    expect(() => {
        dt.toBuffer(Infinity, false);
    }).toThrow();
    expect(() => {
        dt.toBuffer(-Infinity);
    }).toThrow();
    expect(() => {
        dt.toBuffer(-Infinity, false);
    }).toThrow();
    expect(() => {
        dt.toBuffer("no number");
    }).toThrow();
    expect(() => {
        dt.toBuffer("no number", false);
    }).toThrow();
}

test("Validation INT8", () => {
    const dt = new IntDataType(1, true);
    testDt(dt, 127n, -128n, "7F", "80", "7F", "80");

    expect(PROOF_BUFFER(dt.toBuffer(18), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(18, false), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("18"), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("18", false), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(18n), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(18n, false), "12")).toBe(true);
});

test("Validation INT16", () => {
    const dt = new IntDataType(2, true);
    testDt(dt, 32767n, -32768n, "FF7F", "0080", "7FFF", "8000");

    expect(PROOF_BUFFER(dt.toBuffer(13330), "1234")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(13330, false), "3412")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("13330"), "1234")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("13330", false), "3412")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(13330n), "1234")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(13330n, false), "3412")).toBe(true);
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

    expect(PROOF_BUFFER(dt.toBuffer(2018915346), "12345678")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(2018915346, false), "78563412")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("2018915346"), "12345678")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("2018915346", false), "78563412")).toBe(
        true,
    );
    expect(PROOF_BUFFER(dt.toBuffer(2018915346n), "12345678")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(2018915346n, false), "78563412")).toBe(
        true,
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

    expect(
        PROOF_BUFFER(dt.toBuffer(-1167088091436534766n), "1234567890ABCDEF"),
    ).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer(-1167088091436534766n, false),
            "EFCDAB9078563412",
        ),
    ).toBe(true);
    expect(
        PROOF_BUFFER(dt.toBuffer("-1167088091436534766"), "1234567890ABCDEF"),
    ).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer("-1167088091436534766", false),
            "EFCDAB9078563412",
        ),
    ).toBe(true);
});

test("Validation UINT8", () => {
    const dt = new IntDataType(1, false);
    testDt(dt, 255n, 0n, "FF", "00", "FF", "00");

    expect(PROOF_BUFFER(dt.toBuffer(18), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(18, false), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("18"), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("18", false), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(18n), "12")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(18n, false), "12")).toBe(true);
});

test("Validation UINT16", () => {
    const dt = new IntDataType(2, false);
    testDt(dt, 65535n, 0n, "FFFF", "0000", "FFFF", "0000");

    expect(PROOF_BUFFER(dt.toBuffer(13330), "1234")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(13330, false), "3412")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("13330"), "1234")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("13330", false), "3412")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(13330n), "1234")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(13330n, false), "3412")).toBe(true);
});

test("Validation UINT32", () => {
    const dt = new IntDataType(4, false);
    testDt(dt, 4294967295n, 0n, "FFFFFFFF", "00000000", "FFFFFFFF", "00000000");

    expect(PROOF_BUFFER(dt.toBuffer(2018915346), "12345678")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(2018915346, false), "78563412")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("2018915346"), "12345678")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer("2018915346", false), "78563412")).toBe(
        true,
    );
    expect(PROOF_BUFFER(dt.toBuffer(2018915346n), "12345678")).toBe(true);
    expect(PROOF_BUFFER(dt.toBuffer(2018915346n, false), "78563412")).toBe(
        true,
    );
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

    expect(
        PROOF_BUFFER(dt.toBuffer(17279655982273016850n), "1234567890ABCDEF"),
    ).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer(17279655982273016850n, false),
            "EFCDAB9078563412",
        ),
    ).toBe(true);
    expect(
        PROOF_BUFFER(dt.toBuffer("17279655982273016850"), "1234567890ABCDEF"),
    ).toBe(true);
    expect(
        PROOF_BUFFER(
            dt.toBuffer("17279655982273016850", false),
            "EFCDAB9078563412",
        ),
    ).toBe(true);
});
