// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { calcIntegerSize } from "../../src/checkInteger";

test("calcIntegerSize signed 1 byte", () => {
    expect(calcIntegerSize(127, true)).toBe(1);
    expect(calcIntegerSize(-128, true)).toBe(1);

    expect(calcIntegerSize(100.35, true)).toBe(1);
    expect(calcIntegerSize(-100.35, true)).toBe(1);

    expect(calcIntegerSize(127.3, true)).toBe(1);
    expect(calcIntegerSize(-128.3, true)).toBe(1);

    expect(calcIntegerSize("127", true)).toBe(1);
    expect(calcIntegerSize("-128", true)).toBe(1);
});

test("calcIntegerSize signed 2 byte", () => {
    expect(calcIntegerSize(128, true)).toBe(2);
    expect(calcIntegerSize(-129, true)).toBe(2);

    expect(calcIntegerSize(128n, true)).toBe(2);
    expect(calcIntegerSize(-129n, true)).toBe(2);

    expect(calcIntegerSize("128", true)).toBe(2);
    expect(calcIntegerSize("-129", true)).toBe(2);

    expect(calcIntegerSize(32767, true)).toBe(2);
    expect(calcIntegerSize(-32768, true)).toBe(2);

    expect(calcIntegerSize(32767.3, true)).toBe(2);
    expect(calcIntegerSize(-32768.3, true)).toBe(2);

    expect(calcIntegerSize(32767n, true)).toBe(2);
    expect(calcIntegerSize(-32768n, true)).toBe(2);

    expect(calcIntegerSize("32767", true)).toBe(2);
    expect(calcIntegerSize("-32768", true)).toBe(2);

    expect(calcIntegerSize("32767.3", true)).toBe(2);
    expect(calcIntegerSize("-32768.3", true)).toBe(2);
});

test("calcIntegerSize signed 4 byte", () => {
    expect(calcIntegerSize(32768, true)).toBe(4);
    expect(calcIntegerSize(-32769, true)).toBe(4);

    expect(calcIntegerSize(32768.3, true)).toBe(4);
    expect(calcIntegerSize(-32769.3, true)).toBe(4);

    expect(calcIntegerSize(32768n, true)).toBe(4);
    expect(calcIntegerSize(-32769n, true)).toBe(4);

    expect(calcIntegerSize("32768", true)).toBe(4);
    expect(calcIntegerSize("-32769", true)).toBe(4);

    expect(calcIntegerSize(2147483647n, true)).toBe(4);
    expect(calcIntegerSize(-2147483648n, true)).toBe(4);

    expect(calcIntegerSize("2147483647", true)).toBe(4);
    expect(calcIntegerSize("-2147483648", true)).toBe(4);

    expect(calcIntegerSize("2147483647.3", true)).toBe(4);
    expect(calcIntegerSize("-2147483648.3", true)).toBe(4);
});

test("calcIntegerSize signed 8 byte", () => {
    expect(calcIntegerSize(2147483648, true)).toBe(8);
    expect(calcIntegerSize(-2147483649, true)).toBe(8);

    expect(calcIntegerSize(2147483648.3, true)).toBe(8);
    expect(calcIntegerSize(-2147483649.3, true)).toBe(8);

    expect(calcIntegerSize(2147483648n, true)).toBe(8);
    expect(calcIntegerSize(-2147483649n, true)).toBe(8);

    expect(calcIntegerSize("2147483648", true)).toBe(8);
    expect(calcIntegerSize("-2147483649", true)).toBe(8);

    expect(calcIntegerSize(Number.MAX_SAFE_INTEGER, true)).toBe(8);
    expect(calcIntegerSize(Number.MIN_SAFE_INTEGER, true)).toBe(8);

    expect(calcIntegerSize(Number.MAX_SAFE_INTEGER + 0.3, true)).toBe(8);
    expect(calcIntegerSize(Number.MIN_SAFE_INTEGER + 0.3, true)).toBe(8);

    expect(calcIntegerSize(9223372036854775807n, true)).toBe(8);
    expect(calcIntegerSize(-9223372036854775808n, true)).toBe(8);

    expect(calcIntegerSize("9223372036854775807", true)).toBe(8);
    expect(calcIntegerSize("-9223372036854775808", true)).toBe(8);

    expect(calcIntegerSize("9223372036854775807.3", true)).toBe(8);
    expect(calcIntegerSize("-9223372036854775808.3", true)).toBe(8);
});

test("calcIntegerSize signed over 8 bytes", () => {
    expect(calcIntegerSize(Number.MAX_SAFE_INTEGER + 1.3, true)).toBe(-1);
    expect(calcIntegerSize(Number.MIN_SAFE_INTEGER - 1.3, true)).toBe(-1);

    expect(calcIntegerSize(9223372036854775808, true)).toBe(-1);
    // rome-ignore lint/correctness/noPrecisionLoss: For tests used in this file
    expect(calcIntegerSize(-9223372036854775809, true)).toBe(-1);

    // rome-ignore lint/correctness/noPrecisionLoss: For tests used in this file
    expect(calcIntegerSize(9223372036854775808.3, true)).toBe(-1);
    // rome-ignore lint/correctness/noPrecisionLoss: For tests used in this file
    expect(calcIntegerSize(-9223372036854775809.3, true)).toBe(-1);

    expect(calcIntegerSize(9223372036854775808n, true)).toBe(-1);
    expect(calcIntegerSize(-9223372036854775809n, true)).toBe(-1);

    expect(calcIntegerSize("9223372036854775808", true)).toBe(-1);
    expect(calcIntegerSize("-9223372036854775809", true)).toBe(-1);

    expect(calcIntegerSize("9223372036854775808.3", true)).toBe(-1);
    expect(calcIntegerSize("-9223372036854775809.3", true)).toBe(-1);
});

test("calcIntegerSize unsigned 1 byte", () => {
    expect(calcIntegerSize(255, false)).toBe(1);
    expect(calcIntegerSize(255.3, false)).toBe(1);

    expect(calcIntegerSize(255n, false)).toBe(1);

    expect(calcIntegerSize("255", false)).toBe(1);
    expect(calcIntegerSize("255.3", false)).toBe(1);
});

test("calcIntegerSize unsigned 2 bytes", () => {
    expect(calcIntegerSize(256, false)).toBe(2);

    expect(calcIntegerSize(256n, false)).toBe(2);

    expect(calcIntegerSize("256", false)).toBe(2);

    expect(calcIntegerSize(65535, false)).toBe(2);
    expect(calcIntegerSize(65535.3, false)).toBe(2);

    expect(calcIntegerSize(65535n, false)).toBe(2);

    expect(calcIntegerSize("65535", false)).toBe(2);
    expect(calcIntegerSize("65535.3", false)).toBe(2);
});

test("calcIntegerSize unsigned 4 bytes", () => {
    expect(calcIntegerSize(65536, false)).toBe(4);

    expect(calcIntegerSize(65536n, false)).toBe(4);

    expect(calcIntegerSize("65536", false)).toBe(4);

    expect(calcIntegerSize(4294967295, false)).toBe(4);
    expect(calcIntegerSize(4294967295.3, false)).toBe(4);

    expect(calcIntegerSize(4294967295n, false)).toBe(4);

    expect(calcIntegerSize("4294967295", false)).toBe(4);
    expect(calcIntegerSize("4294967295.3", false)).toBe(4);
});

test("calcIntegerSize unsigned 8 bytes", () => {
    expect(calcIntegerSize(4294967296, false)).toBe(8);

    expect(calcIntegerSize(4294967296n, false)).toBe(8);

    expect(calcIntegerSize("4294967296", false)).toBe(8);

    expect(calcIntegerSize(Number.MAX_SAFE_INTEGER, false)).toBe(8);
    expect(calcIntegerSize(Number.MAX_SAFE_INTEGER + 0.3, false)).toBe(8);

    expect(calcIntegerSize(18446744073709551615n, false)).toBe(8);

    expect(calcIntegerSize("18446744073709551615", false)).toBe(8);
    expect(calcIntegerSize("18446744073709551615.3", false)).toBe(8);
});

test("calcIntegerSize unsigned out of range", () => {
    expect(calcIntegerSize(Number.MAX_SAFE_INTEGER + 1, false)).toBe(-1);

    expect(calcIntegerSize(18446744073709551616, false)).toBe(-1);
    // rome-ignore lint/correctness/noPrecisionLoss: For tests used in this file
    expect(calcIntegerSize(18446744073709551616.3, false)).toBe(-1);

    expect(calcIntegerSize(18446744073709551616n, false)).toBe(-1);

    expect(calcIntegerSize("18446744073709551616", false)).toBe(-1);
    expect(calcIntegerSize("18446744073709551616.3", false)).toBe(-1);

    expect(calcIntegerSize(-1, false)).toBe(-1);

    expect(calcIntegerSize(-1n, false)).toBe(-1);

    expect(calcIntegerSize("-1", false)).toBe(-1);
});

test("calcIntegerSize not parseable", () => {
    expect(calcIntegerSize(NaN, true)).toBe(-1);
    expect(calcIntegerSize(NaN, false)).toBe(-1);
    expect(calcIntegerSize(Infinity, true)).toBe(-1);
    expect(calcIntegerSize(Infinity, false)).toBe(-1);
    expect(calcIntegerSize(-Infinity, true)).toBe(-1);
    expect(calcIntegerSize(-Infinity, false)).toBe(-1);
    expect(calcIntegerSize("No number", false)).toBe(-1);
});
