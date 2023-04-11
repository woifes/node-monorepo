// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { IntArrDataType } from "../../../src/IntArrDataType";

function PROOF_BUFFER(buf: Buffer, hexVal: string) {
    return buf.equals(Buffer.from(hexVal, "hex"));
}

function hexBuf(hex: string) {
    return Buffer.from(hex, "hex");
}

function testDt(
    dt: IntArrDataType,
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

    if (typeof MAX === "number" && typeof MIN === "number") {
        expect(() => {
            dt.toString(MAX);
        }).toThrow();
        expect(() => {
            dt.toString(MIN);
        }).toThrow();
        expect(() => {
            dt.toString(MAX, false);
        }).toThrow();
        expect(() => {
            dt.toString(MIN, false);
        }).toThrow();

        expect(dt.toString([MAX, MIN, MAX, MIN])).toEqual(
            `[${MAX},${MIN},${MAX},${MIN}]`,
        );
        expect(dt.toString([MAX, MIN, MAX, MIN], false)).toEqual(
            `[${MAX},${MIN},${MAX},${MIN}]`,
        );
        expect(() => {
            dt.toString([MAX + 1, MIN, MAX, MIN]);
        }).toThrow();
        expect(() => {
            dt.toString([MAX, MIN - 1, MAX, MIN]);
        }).toThrow();
        expect(() => {
            dt.toString([MAX + 1, MIN, MAX, MIN], false);
        }).toThrow();
        expect(() => {
            dt.toString([MAX, MIN - 1, MAX, MIN], false);
        }).toThrow();
        //float
        expect(() => {
            dt.toString(MAX + 0.3);
        }).toThrow();
        expect(() => {
            dt.toString(MIN - 0.3);
        }).toThrow();
        expect(() => {
            dt.toString(MAX + 0.3, false);
        }).toThrow();
        expect(() => {
            dt.toString(MIN - 0.3, false);
        }).toThrow();

        expect(
            dt.toString([MAX + 0.3, MIN - 0.3, MAX + 0.3, MIN - 0.3]),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
        expect(
            dt.toString([MAX + 0.3, MIN - 0.3, MAX + 0.3, MIN - 0.3], false),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
        expect(() => {
            dt.toString([MAX + 1.3, MIN, MAX, MIN]);
        }).toThrow();
        expect(() => {
            dt.toString([MAX, MIN - 1.3, MAX, MIN]);
        }).toThrow();
        expect(() => {
            dt.toString([MAX + 1.3, MIN, MAX, MIN], false);
        }).toThrow();
        expect(() => {
            dt.toString([MAX, MIN - 1.3, MAX, MIN], false);
        }).toThrow();
    }
    expect(() => {
        dt.toString(BI_MAX);
    }).toThrow();
    expect(() => {
        dt.toString(BI_MIN);
    }).toThrow();
    expect(() => {
        dt.toString(BI_MAX), false;
    }).toThrow();
    expect(() => {
        dt.toString(BI_MIN), false;
    }).toThrow();
    if (BUF_MAX.length === 8) {
        expect(dt.toString([BI_MAX, BI_MIN, BI_MAX, BI_MIN])).toEqual(
            `["${MAX}","${MIN}","${MAX}","${MIN}"]`,
        );
        expect(dt.toString([BI_MAX, BI_MIN, BI_MAX, BI_MIN], false)).toEqual(
            `["${MAX}","${MIN}","${MAX}","${MIN}"]`,
        );
    } else {
        expect(dt.toString([BI_MAX, BI_MIN, BI_MAX, BI_MIN])).toEqual(
            `[${MAX},${MIN},${MAX},${MIN}]`,
        );
        expect(dt.toString([BI_MAX, BI_MIN, BI_MAX, BI_MIN], false)).toEqual(
            `[${MAX},${MIN},${MAX},${MIN}]`,
        );
    }
    expect(() => {
        dt.toString([BI_MAX + 1n, BI_MIN, BI_MAX, BI_MIN]);
    }).toThrow();
    expect(() => {
        dt.toString([BI_MAX, BI_MIN - 1n, BI_MAX, BI_MIN]);
    }).toThrow();
    expect(() => {
        dt.toString([BI_MAX + 1n, BI_MIN, BI_MAX, BI_MIN], false);
    }).toThrow();
    expect(() => {
        dt.toString([BI_MAX, BI_MIN - 1n, BI_MAX, BI_MIN], false);
    }).toThrow();
    //plain string
    expect(() => {
        dt.toString(S_MAX);
    }).toThrow();
    expect(() => {
        dt.toString(S_MIN);
    }).toThrow();
    //plain string float
    expect(() => {
        dt.toString(`${S_MAX}.3`);
    }).toThrow();
    expect(() => {
        dt.toString(`${S_MIN}.3`);
    }).toThrow();
    //stringified array of string
    if (BUF_MAX.length === 8) {
        expect(
            dt.toString(
                `[ "${BI_MAX}", "${BI_MIN}", "${BI_MAX}", "${BI_MIN}" ]`,
            ),
        ).toEqual(`["${MAX}","${MIN}","${MAX}","${MIN}"]`);
        expect(
            dt.toString(
                `[ "${BI_MAX}", "${BI_MIN}", "${BI_MAX}", "${BI_MIN}" ]`,
                false,
            ),
        ).toEqual(`["${MAX}","${MIN}","${MAX}","${MIN}"]`);
    } else {
        expect(
            dt.toString(
                `[ "${BI_MAX}", "${BI_MIN}", "${BI_MAX}", "${BI_MIN}" ]`,
            ),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
        expect(
            dt.toString(
                `[ "${BI_MAX}", "${BI_MIN}", "${BI_MAX}", "${BI_MIN}" ]`,
                false,
            ),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
    }
    expect(() => {
        dt.toString(
            `[ "${BI_MAX + 1n}", "${BI_MIN}", "${BI_MAX}", "${BI_MIN}" ]`,
        );
    }).toThrow();
    expect(() => {
        dt.toString(
            `[ "${BI_MAX}", "${BI_MIN - 1n}", "${BI_MAX}", "${BI_MIN}" ]`,
        );
    }).toThrow();
    expect(() => {
        dt.toString(
            `[ "${BI_MAX + 1n}", "${BI_MIN}", "${BI_MAX}", "${BI_MIN}" ]`,
            false,
        );
    }).toThrow();
    expect(() => {
        dt.toString(
            `[ "${BI_MAX}", "${BI_MIN - 1n}", "${BI_MAX}", "${BI_MIN}" ]`,
            false,
        );
    }).toThrow();
    //stringified array of string with float
    if (BUF_MAX.length === 8) {
        expect(
            dt.toString(
                `[ "${BI_MAX}.3", "${BI_MIN}.3", "${BI_MAX}.3", "${BI_MIN}.3" ]`,
            ),
        ).toEqual(`["${MAX}","${MIN}","${MAX}","${MIN}"]`);
        expect(
            dt.toString(
                `[ "${BI_MAX}.3", "${BI_MIN}.3", "${BI_MAX}.3", "${BI_MIN}.3" ]`,
                false,
            ),
        ).toEqual(`["${MAX}","${MIN}","${MAX}","${MIN}"]`);
    } else {
        expect(
            dt.toString(
                `[ "${BI_MAX}.3", "${BI_MIN}.3", "${BI_MAX}.3", "${BI_MIN}.3" ]`,
            ),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
        expect(
            dt.toString(
                `[ "${BI_MAX}.3", "${BI_MIN}.3", "${BI_MAX}.3", "${BI_MIN}.3" ]`,
                false,
            ),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
    }
    expect(() => {
        dt.toString(
            `[ "${BI_MAX + 1n}.3", "${BI_MIN}", "${BI_MAX}", "${BI_MIN}" ]`,
        );
    }).toThrow();
    expect(() => {
        dt.toString(
            `[ "${BI_MAX}", "${BI_MIN - 1n}.3", "${BI_MAX}", "${BI_MIN}" ]`,
        );
    }).toThrow();
    expect(() => {
        dt.toString(
            `[ "${BI_MAX + 1n}.3", "${BI_MIN}", "${BI_MAX}", "${BI_MIN}" ]`,
            false,
        );
    }).toThrow();
    expect(() => {
        dt.toString(
            `[ "${BI_MAX}", "${BI_MIN - 1n}.3", "${BI_MAX}", "${BI_MIN}" ]`,
            false,
        );
    }).toThrow();
    //array of string
    if (BUF_MAX.length === 8) {
        expect(dt.toString([S_MAX, S_MIN, S_MAX, S_MIN])).toEqual(
            `["${MAX}","${MIN}","${MAX}","${MIN}"]`,
        );
        expect(dt.toString([S_MAX, S_MIN, S_MAX, S_MIN], false)).toEqual(
            `["${MAX}","${MIN}","${MAX}","${MIN}"]`,
        );
    } else {
        expect(dt.toString([S_MAX, S_MIN, S_MAX, S_MIN])).toEqual(
            `[${MAX},${MIN},${MAX},${MIN}]`,
        );
        expect(dt.toString([S_MAX, S_MIN, S_MAX, S_MIN], false)).toEqual(
            `[${MAX},${MIN},${MAX},${MIN}]`,
        );
    }
    expect(() => {
        dt.toString([`${BI_MAX + 1n}`, `${BI_MIN}`, `${BI_MAX}`, `${BI_MIN}`]);
    }).toThrow();
    expect(() => {
        dt.toString([`${BI_MAX}`, `${BI_MIN - 1n}`, `${BI_MAX}`, `${BI_MIN}`]);
    }).toThrow();
    expect(() => {
        dt.toString(
            [`${BI_MAX + 1n}`, `${BI_MIN}`, `${BI_MAX}`, `${BI_MIN}`],
            false,
        );
    }).toThrow();
    expect(() => {
        dt.toString(
            [`${BI_MAX}`, `${BI_MIN - 1n}`, `${BI_MAX}`, `${BI_MIN}`],
            false,
        );
    }).toThrow();
    //array of string with float
    if (BUF_MAX.length === 8) {
        expect(
            dt.toString([
                `${S_MAX}.3`,
                `${S_MIN}.3`,
                `${S_MAX}.3`,
                `${S_MIN}.3`,
            ]),
        ).toEqual(`["${MAX}","${MIN}","${MAX}","${MIN}"]`);
        expect(
            dt.toString(
                [`${S_MAX}.3`, `${S_MIN}.3`, `${S_MAX}.3`, `${S_MIN}.3`],
                false,
            ),
        ).toEqual(`["${MAX}","${MIN}","${MAX}","${MIN}"]`);
    } else {
        expect(
            dt.toString([
                `${S_MAX}.3`,
                `${S_MIN}.3`,
                `${S_MAX}.3`,
                `${S_MIN}.3`,
            ]),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
        expect(
            dt.toString(
                [`${S_MAX}.3`, `${S_MIN}.3`, `${S_MAX}.3`, `${S_MIN}.3`],
                false,
            ),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
    }
    expect(() => {
        dt.toString([
            `${BI_MAX + 1n}.3`,
            `${BI_MIN}`,
            `${BI_MAX}`,
            `${BI_MIN}`,
        ]);
    }).toThrow();
    expect(() => {
        dt.toString([
            `${BI_MAX}`,
            `${BI_MIN - 1n}.3`,
            `${BI_MAX}`,
            `${BI_MIN}`,
        ]);
    }).toThrow();
    expect(() => {
        dt.toString(
            [`${BI_MAX + 1n}.3`, `${BI_MIN}`, `${BI_MAX}`, `${BI_MIN}`],
            false,
        );
    }).toThrow();
    expect(() => {
        dt.toString(
            [`${BI_MAX}`, `${BI_MIN - 1n}.3`, `${BI_MAX}`, `${BI_MIN}`],
            false,
        );
    }).toThrow();
    //Buffer
    if (BUF_MAX.length === 8) {
        expect(dt.toString(hexBuf(X_MAX + X_MIN + X_MAX + X_MIN))).toEqual(
            `["${MAX}","${MIN}","${MAX}","${MIN}"]`,
        );
        expect(
            dt.toString(
                hexBuf(X_MAX_BE + X_MIN_BE + X_MAX_BE + X_MIN_BE),
                false,
            ),
        ).toEqual(`["${MAX}","${MIN}","${MAX}","${MIN}"]`);
    } else {
        expect(dt.toString(hexBuf(X_MAX + X_MIN + X_MAX + X_MIN))).toEqual(
            `[${MAX},${MIN},${MAX},${MIN}]`,
        );
        expect(
            dt.toString(
                hexBuf(X_MAX_BE + X_MIN_BE + X_MAX_BE + X_MIN_BE),
                false,
            ),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
    }
    if (BUF_MAX.length > 1) {
        expect(() => {
            dt.toString(hexBuf(`${X_MAX}${X_MIN}${X_MAX}${X_MIN}10`));
        }).toThrow();
    }
    //Array of Buffers
    if (BUF_MAX.length === 8) {
        expect(dt.toString([BUF_MAX, BUF_MIN, BUF_MAX, BUF_MIN])).toEqual(
            `["${MAX}","${MIN}","${MAX}","${MIN}"]`,
        );
        expect(
            dt.toString(
                [BUF_MAX_BE, BUF_MIN_BE, BUF_MAX_BE, BUF_MIN_BE],
                false,
            ),
        ).toEqual(`["${MAX}","${MIN}","${MAX}","${MIN}"]`);
    } else {
        expect(dt.toString([BUF_MAX, BUF_MIN, BUF_MAX, BUF_MIN])).toEqual(
            `[${MAX},${MIN},${MAX},${MIN}]`,
        );
        expect(
            dt.toString(
                [BUF_MAX_BE, BUF_MIN_BE, BUF_MAX_BE, BUF_MIN_BE],
                false,
            ),
        ).toEqual(`[${MAX},${MIN},${MAX},${MIN}]`);
    }
    expect(() => {
        dt.toString([BUF_MAX, BUF_MIN, BUF_MAX, BUF_MIN, hexBuf(`10${S_MAX}`)]);
    }).toThrow();

    expect(() => {
        dt.toString([NaN, 1, 2, 3]);
    }).toThrow();
    expect(() => {
        dt.toString([1, Infinity, 2, 3]);
    }).toThrow();
    expect(() => {
        dt.toString([1, 2, -Infinity, 3]);
    }).toThrow();
    expect(() => {
        dt.toString(["1", "2", "3", "no number"]);
    }).toThrow();
}

test("Test ARRAY_OF_INT8", () => {
    const dt = new IntArrDataType(1, true);
    testDt(dt, 127n, -128n, "7F", "80", "7F", "80");

    expect(dt.toString(hexBuf("12121212"))).toEqual("[18,18,18,18]");
    expect(dt.toString(hexBuf("12121212"), false)).toEqual("[18,18,18,18]");
});

test("Test ARRAY_OF_INT16", () => {
    const dt = new IntArrDataType(2, true);
    testDt(dt, 32767n, -32768n, "FF7F", "0080", "7FFF", "8000");

    expect(dt.toString(hexBuf("1234123412341234"))).toEqual(
        "[13330,13330,13330,13330]",
    );
    expect(dt.toString(hexBuf("3412341234123412"), false)).toEqual(
        "[13330,13330,13330,13330]",
    );
});

test("Test ARRAY_OF_INT32", () => {
    const dt = new IntArrDataType(4, true);
    testDt(
        dt,
        2147483647n,
        -2147483648n,
        "FFFFFF7F",
        "00000080",
        "7FFFFFFF",
        "80000000",
    );

    expect(dt.toString(hexBuf("12345678123456781234567812345678"))).toEqual(
        "[2018915346,2018915346,2018915346,2018915346]",
    );
    expect(
        dt.toString(hexBuf("78563412785634127856341278563412"), false),
    ).toEqual("[2018915346,2018915346,2018915346,2018915346]");
});

test("Test ARRAY_OF_INT64", () => {
    const dt = new IntArrDataType(8, true);
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
        dt.toString(
            hexBuf(
                "1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF",
            ),
        ),
    ).toEqual(
        '["-1167088091436534766","-1167088091436534766","-1167088091436534766","-1167088091436534766"]',
    );
    expect(
        dt.toString(
            hexBuf(
                "EFCDAB9078563412EFCDAB9078563412EFCDAB9078563412EFCDAB9078563412",
            ),
            false,
        ),
    ).toEqual(
        '["-1167088091436534766","-1167088091436534766","-1167088091436534766","-1167088091436534766"]',
    );
});

test("Test ARRAY_OF_UINT8", () => {
    const dt = new IntArrDataType(1, false);
    testDt(dt, 255n, 0n, "FF", "00", "FF", "00");

    expect(dt.toString(hexBuf("12121212"))).toEqual("[18,18,18,18]");
    expect(dt.toString(hexBuf("12121212"), false)).toEqual("[18,18,18,18]");
});

test("Test ARRAY_OF_UINT16", () => {
    const dt = new IntArrDataType(2, false);
    testDt(dt, 65535n, 0n, "FFFF", "0000", "FFFF", "0000");

    expect(dt.toString(hexBuf("1234123412341234"))).toEqual(
        "[13330,13330,13330,13330]",
    );
    expect(dt.toString(hexBuf("3412341234123412"), false)).toEqual(
        "[13330,13330,13330,13330]",
    );
});

test("Test ARRAY_OF_UINT32", () => {
    const dt = new IntArrDataType(4, false);
    testDt(dt, 4294967295n, 0n, "FFFFFFFF", "00000000", "FFFFFFFF", "00000000");

    expect(dt.toString(hexBuf("12345678123456781234567812345678"))).toEqual(
        "[2018915346,2018915346,2018915346,2018915346]",
    );
    expect(
        dt.toString(hexBuf("78563412785634127856341278563412"), false),
    ).toEqual("[2018915346,2018915346,2018915346,2018915346]");
});

test("Test ARRAY_OF_UINT64", () => {
    const dt = new IntArrDataType(8, false);
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
        dt.toString(
            hexBuf(
                "1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF",
            ),
        ),
    ).toEqual(
        '["17279655982273016850","17279655982273016850","17279655982273016850","17279655982273016850"]',
    );
    expect(
        dt.toString(
            hexBuf(
                "EFCDAB9078563412EFCDAB9078563412EFCDAB9078563412EFCDAB9078563412",
            ),
            false,
        ),
    ).toEqual(
        '["17279655982273016850","17279655982273016850","17279655982273016850","17279655982273016850"]',
    );
});
