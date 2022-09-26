// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { calcTypeOfArray } from "../../src/checkInteger";

test("test empty array", () => {
    expect(calcTypeOfArray([])).toEqual(null);
});

test("test array of number", () => {
    expect(calcTypeOfArray([1, 255, 0])).toEqual("ARRAY_OF_UINT8");
    expect(calcTypeOfArray([-1, 255, 0])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray([1, 65535, 0])).toEqual("ARRAY_OF_UINT16");
    expect(calcTypeOfArray([-1, 65535, 0])).toEqual("ARRAY_OF_INT32");
    expect(calcTypeOfArray([1, 4294967295, 0])).toEqual("ARRAY_OF_UINT32");
    expect(calcTypeOfArray([-1, 4294967295, 0])).toEqual("ARRAY_OF_INT64");
    expect(calcTypeOfArray([1, Number.MAX_SAFE_INTEGER, 0])).toEqual(
        "ARRAY_OF_UINT64"
    );
    expect(
        calcTypeOfArray([Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0])
    ).toEqual("ARRAY_OF_INT64");

    expect(calcTypeOfArray([-127, 7, 0])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray([-128, 7, 0])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray([-32768, 7, 0])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray([-2147483648, 7, 0])).toEqual("ARRAY_OF_INT32");
    expect(calcTypeOfArray([Number.MIN_SAFE_INTEGER, 7, 0])).toEqual(
        "ARRAY_OF_INT64"
    );
});

test("test array of float number", () => {
    expect(calcTypeOfArray([1, 255.3, 0])).toEqual("ARRAY_OF_UINT8");
    expect(calcTypeOfArray([-1, 255.3, 0])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray([1, 65535.3, 0])).toEqual("ARRAY_OF_UINT16");
    expect(calcTypeOfArray([-1, 65535.3, 0])).toEqual("ARRAY_OF_INT32");
    expect(calcTypeOfArray([1, 4294967295.3, 0])).toEqual("ARRAY_OF_UINT32");
    expect(calcTypeOfArray([-1, 4294967295.3, 0])).toEqual("ARRAY_OF_INT64");
    expect(calcTypeOfArray([1, Number.MAX_SAFE_INTEGER + 0.3, 0])).toEqual(
        "ARRAY_OF_UINT64"
    );
    expect(
        calcTypeOfArray([
            Number.MIN_SAFE_INTEGER + 0.3,
            Number.MAX_SAFE_INTEGER + 0.3,
            0,
        ])
    ).toEqual("ARRAY_OF_INT64");

    expect(calcTypeOfArray([-127.3, 7, 0])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray([-128.3, 7, 0])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray([-32768.3, 7, 0])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray([-2147483648.3, 7, 0])).toEqual("ARRAY_OF_INT32");
    expect(calcTypeOfArray([Number.MIN_SAFE_INTEGER - 0.3, 7, 0])).toEqual(
        "ARRAY_OF_INT64"
    );
});

test("test array of bigint", () => {
    expect(calcTypeOfArray([1n, 255n, 0n])).toEqual("ARRAY_OF_UINT8");
    expect(calcTypeOfArray([-1n, 255n, 0n])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray([1n, 65535n, 0n])).toEqual("ARRAY_OF_UINT16");
    expect(calcTypeOfArray([-1n, 65535n, 0n])).toEqual("ARRAY_OF_INT32");
    expect(calcTypeOfArray([1n, 4294967295n, 0n])).toEqual("ARRAY_OF_UINT32");
    expect(calcTypeOfArray([-1n, 4294967295n, 0n])).toEqual("ARRAY_OF_INT64");
    expect(calcTypeOfArray([1n, 18446744073709551615n, 0n])).toEqual(
        "ARRAY_OF_UINT64"
    );
    expect(calcTypeOfArray([-1n, 18446744073709551615n, 0n])).toEqual(null);
    //to big for UINT64
    expect(calcTypeOfArray([0n, 18446744073709551616n, 0n])).toEqual(null);

    expect(calcTypeOfArray([-127n, 7n, 0n])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray([-128n, 7n, 0n])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray([-32768n, 7n, 0n])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray([-2147483648n, 7n, 0n])).toEqual("ARRAY_OF_INT32");
    expect(calcTypeOfArray([-9223372036854775808n, 7n, 0n])).toEqual(
        "ARRAY_OF_INT64"
    );
    //to low for INT64
    expect(calcTypeOfArray([-9223372036854775809n, 7n, 0n])).toEqual(null);
});

test("test array of string", () => {
    expect(calcTypeOfArray(["1", "255", "0"])).toEqual("ARRAY_OF_UINT8");
    expect(calcTypeOfArray(["-1", "255", "0"])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray(["1", "65535", "0"])).toEqual("ARRAY_OF_UINT16");
    expect(calcTypeOfArray(["-1", "65535", "0"])).toEqual("ARRAY_OF_INT32");
    expect(calcTypeOfArray(["1", "4294967295", "0"])).toEqual(
        "ARRAY_OF_UINT32"
    );
    expect(calcTypeOfArray(["-1", "4294967295", "0"])).toEqual(
        "ARRAY_OF_INT64"
    );
    expect(calcTypeOfArray(["1", "18446744073709551615", "0"])).toEqual(
        "ARRAY_OF_UINT64"
    );
    expect(calcTypeOfArray(["-1", "18446744073709551615", "0"])).toEqual(null);
    //to big for UINT64
    expect(calcTypeOfArray(["0", "18446744073709551616", "0"])).toEqual(null);

    expect(calcTypeOfArray(["-127", "7", "0"])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray(["-128", "7", "0"])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray(["-32768", "7", "0"])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray(["-2147483648", "7", "0"])).toEqual(
        "ARRAY_OF_INT32"
    );
    expect(calcTypeOfArray(["-9223372036854775808", "7", "0"])).toEqual(
        "ARRAY_OF_INT64"
    );
    //to low for INT64
    expect(calcTypeOfArray(["-9223372036854775809", "7", "0"])).toEqual(null);
});

test("test array of string with floats.3", () => {
    expect(calcTypeOfArray(["1", "255.3", "0"])).toEqual("ARRAY_OF_UINT8");
    expect(calcTypeOfArray(["-1", "255.3", "0"])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray(["1", "65535.3", "0"])).toEqual("ARRAY_OF_UINT16");
    expect(calcTypeOfArray(["-1", "65535.3", "0"])).toEqual("ARRAY_OF_INT32");
    expect(calcTypeOfArray(["1", "4294967295.3", "0"])).toEqual(
        "ARRAY_OF_UINT32"
    );
    expect(calcTypeOfArray(["-1", "4294967295.3", "0"])).toEqual(
        "ARRAY_OF_INT64"
    );
    expect(calcTypeOfArray(["1", "18446744073709551615.3", "0"])).toEqual(
        "ARRAY_OF_UINT64"
    );
    expect(calcTypeOfArray(["-1", "18446744073709551615.3", "0"])).toEqual(
        null
    );
    //to big for UINT64
    expect(calcTypeOfArray(["0", "18446744073709551616.3", "0"])).toEqual(null);

    expect(calcTypeOfArray(["-127.3", "7", "0"])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray(["-128.3", "7", "0"])).toEqual("ARRAY_OF_INT8");
    expect(calcTypeOfArray(["-32768.3", "7", "0"])).toEqual("ARRAY_OF_INT16");
    expect(calcTypeOfArray(["-2147483648.3", "7", "0"])).toEqual(
        "ARRAY_OF_INT32"
    );
    expect(calcTypeOfArray(["-9223372036854775808.3", "7", "0"])).toEqual(
        "ARRAY_OF_INT64"
    );
    //to low for INT64
    expect(calcTypeOfArray(["-9223372036854775809.3", "7", "0"])).toEqual(null);
});
