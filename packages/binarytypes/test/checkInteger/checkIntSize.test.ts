// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { checkIntSize } from "../../src/checkInteger";

/* eslint-disable @typescript-eslint/no-loss-of-precision */

test("checkIntBounds signed 1 byte", () => {
    //good
    expect(checkIntSize(127, true, 1)).toBe(true);
    expect(checkIntSize(-128, true, 1)).toBe(true);
    expect(checkIntSize(127.3, true, 1)).toBe(true);
    expect(checkIntSize(-128.3, true, 1)).toBe(true);

    expect(checkIntSize(127n, true, 1)).toBe(true);
    expect(checkIntSize(-128n, true, 1)).toBe(true);

    expect(checkIntSize("127", true, 1)).toBe(true);
    expect(checkIntSize("-128", true, 1)).toBe(true);
    expect(checkIntSize("127.3", true, 1)).toBe(true);
    expect(checkIntSize("-128.3", true, 1)).toBe(true);
    //bad
    expect(checkIntSize(128, true, 1)).toBe(false);
    expect(checkIntSize(-129, true, 1)).toBe(false);
    expect(checkIntSize(128.3, true, 1)).toBe(false);
    expect(checkIntSize(-129.3, true, 1)).toBe(false);

    expect(checkIntSize(128n, true, 1)).toBe(false);
    expect(checkIntSize(-129n, true, 1)).toBe(false);

    expect(checkIntSize("128", true, 1)).toBe(false);
    expect(checkIntSize("-129", true, 1)).toBe(false);
    expect(checkIntSize("128.3", true, 1)).toBe(false);
    expect(checkIntSize("-129.3", true, 1)).toBe(false);
});

test("checkIntBounds signed 2 byte", () => {
    //good
    expect(checkIntSize(32767, true, 2)).toBe(true);
    expect(checkIntSize(-32768, true, 2)).toBe(true);
    expect(checkIntSize(32767.3, true, 2)).toBe(true);
    expect(checkIntSize(-32768.3, true, 2)).toBe(true);

    expect(checkIntSize(32767n, true, 2)).toBe(true);
    expect(checkIntSize(-32768n, true, 2)).toBe(true);

    expect(checkIntSize("32767", true, 2)).toBe(true);
    expect(checkIntSize("-32768", true, 2)).toBe(true);
    expect(checkIntSize("32767.3", true, 2)).toBe(true);
    expect(checkIntSize("-32768.3", true, 2)).toBe(true);
    //bad
    expect(checkIntSize(32768, true, 2)).toBe(false);
    expect(checkIntSize(-32769, true, 2)).toBe(false);
    expect(checkIntSize(32768.3, true, 2)).toBe(false);
    expect(checkIntSize(-32769.3, true, 2)).toBe(false);

    expect(checkIntSize(32768n, true, 2)).toBe(false);
    expect(checkIntSize(-32769n, true, 2)).toBe(false);

    expect(checkIntSize("32768", true, 2)).toBe(false);
    expect(checkIntSize("-32769", true, 2)).toBe(false);
    expect(checkIntSize("32768.3", true, 2)).toBe(false);
    expect(checkIntSize("-32769.3", true, 2)).toBe(false);
});

test("checkIntBounds signed 4 byte", () => {
    //good
    expect(checkIntSize(2147483647, true, 4)).toBe(true);
    expect(checkIntSize(-2147483648, true, 4)).toBe(true);
    expect(checkIntSize(2147483647.3, true, 4)).toBe(true);
    expect(checkIntSize(-2147483648.3, true, 4)).toBe(true);

    expect(checkIntSize(2147483647n, true, 4)).toBe(true);
    expect(checkIntSize(-2147483648n, true, 4)).toBe(true);

    expect(checkIntSize("2147483647", true, 4)).toBe(true);
    expect(checkIntSize("-2147483648", true, 4)).toBe(true);
    expect(checkIntSize("2147483647.3", true, 4)).toBe(true);
    expect(checkIntSize("-2147483648.3", true, 4)).toBe(true);

    //bad
    expect(checkIntSize(2147483648, true, 4)).toBe(false);
    expect(checkIntSize(-2147483649, true, 4)).toBe(false);
    expect(checkIntSize(2147483648.3, true, 4)).toBe(false);
    expect(checkIntSize(-2147483649.3, true, 4)).toBe(false);

    expect(checkIntSize(2147483648n, true, 4)).toBe(false);
    expect(checkIntSize(-2147483649n, true, 4)).toBe(false);

    expect(checkIntSize("2147483648", true, 4)).toBe(false);
    expect(checkIntSize("-2147483649", true, 4)).toBe(false);
    expect(checkIntSize("2147483648.3", true, 4)).toBe(false);
    expect(checkIntSize("-2147483649.3", true, 4)).toBe(false);
});

test("checkIntBounds signed 8 byte", () => {
    //good
    expect(checkIntSize(Number.MAX_SAFE_INTEGER, true, 8)).toBe(true);
    expect(checkIntSize(Number.MIN_SAFE_INTEGER, true, 8)).toBe(true);
    expect(checkIntSize(Number.MAX_SAFE_INTEGER + 0.3, true, 8)).toBe(true);
    expect(checkIntSize(Number.MIN_SAFE_INTEGER + 0.3, true, 8)).toBe(true);

    expect(checkIntSize(9223372036854775807n, true, 8)).toBe(true);
    expect(checkIntSize(-9223372036854775808n, true, 8)).toBe(true);

    expect(checkIntSize("9223372036854775807", true, 8)).toBe(true);
    expect(checkIntSize("-9223372036854775808", true, 8)).toBe(true);
    expect(checkIntSize("9223372036854775807.3", true, 8)).toBe(true);
    expect(checkIntSize("-9223372036854775808.3", true, 8)).toBe(true);
    //bad
    expect(checkIntSize(Number.MAX_SAFE_INTEGER + 1, true, 8)).toBe(false);
    expect(checkIntSize(Number.MIN_SAFE_INTEGER - 1, true, 8)).toBe(false);
    expect(checkIntSize(Number.MAX_SAFE_INTEGER + 1.3, true, 8)).toBe(false);
    expect(checkIntSize(Number.MIN_SAFE_INTEGER - 1.3, true, 8)).toBe(false);

    expect(checkIntSize(9223372036854775808n, true, 8)).toBe(false);
    expect(checkIntSize(-9223372036854775809n, true, 8)).toBe(false);

    expect(checkIntSize("9223372036854775808", true, 8)).toBe(false);
    expect(checkIntSize("-9223372036854775809", true, 8)).toBe(false);
    expect(checkIntSize("9223372036854775808.3", true, 8)).toBe(false);
    expect(checkIntSize("-9223372036854775809.3", true, 8)).toBe(false);
});

test("checkIntBounds unsigned 1 byte", () => {
    expect(checkIntSize(255, false, 1)).toBe(true);
    expect(checkIntSize(255.3, false, 1)).toBe(true);
    expect(checkIntSize(255n, false, 1)).toBe(true);
    expect(checkIntSize("255", false, 1)).toBe(true);
    expect(checkIntSize("255.3", false, 1)).toBe(true);

    expect(checkIntSize(-1, false, 1)).toBe(false);
    expect(checkIntSize(-1.3, false, 1)).toBe(false);
    expect(checkIntSize(-1n, false, 1)).toBe(false);
    expect(checkIntSize("-1", false, 1)).toBe(false);
    expect(checkIntSize("-1.3", false, 1)).toBe(false);

    expect(checkIntSize(256.3, false, 1)).toBe(false);
    expect(checkIntSize(256, false, 1)).toBe(false);
    expect(checkIntSize(256n, false, 1)).toBe(false);
    expect(checkIntSize("256", false, 1)).toBe(false);
    expect(checkIntSize("256.3", false, 1)).toBe(false);
});

test("checkIntBounds unsigned 2 bytes", () => {
    expect(checkIntSize(65535, false, 2)).toBe(true);
    expect(checkIntSize(65535.3, false, 2)).toBe(true);
    expect(checkIntSize(65535n, false, 2)).toBe(true);
    expect(checkIntSize("65535", false, 2)).toBe(true);
    expect(checkIntSize("65535.3", false, 2)).toBe(true);

    expect(checkIntSize(-1, false, 2)).toBe(false);
    expect(checkIntSize(-1.3, false, 2)).toBe(false);
    expect(checkIntSize(-1n, false, 2)).toBe(false);
    expect(checkIntSize("-1", false, 2)).toBe(false);
    expect(checkIntSize("-1.3", false, 2)).toBe(false);

    expect(checkIntSize(65536, false, 2)).toBe(false);
    expect(checkIntSize(65536.3, false, 2)).toBe(false);
    expect(checkIntSize(65536n, false, 2)).toBe(false);
    expect(checkIntSize("65536", false, 2)).toBe(false);
    expect(checkIntSize("65536.3", false, 2)).toBe(false);
});

test("checkIntBounds unsigned 4 bytes", () => {
    expect(checkIntSize(4294967295, false, 4)).toBe(true);
    expect(checkIntSize(4294967295.3, false, 4)).toBe(true);
    expect(checkIntSize(4294967295n, false, 4)).toBe(true);
    expect(checkIntSize("4294967295", false, 4)).toBe(true);
    expect(checkIntSize("4294967295.3", false, 4)).toBe(true);

    expect(checkIntSize(-1, false, 4)).toBe(false);
    expect(checkIntSize(-1.3, false, 4)).toBe(false);
    expect(checkIntSize(-1n, false, 4)).toBe(false);
    expect(checkIntSize("-1", false, 4)).toBe(false);
    expect(checkIntSize("-1.3", false, 4)).toBe(false);

    expect(checkIntSize(4294967296, false, 4)).toBe(false);
    expect(checkIntSize(4294967296.3, false, 4)).toBe(false);
    expect(checkIntSize(4294967296n, false, 4)).toBe(false);
    expect(checkIntSize("4294967296", false, 4)).toBe(false);
    expect(checkIntSize("4294967296.3", false, 4)).toBe(false);
});

test("checkIntBounds unsigned 8 bytes", () => {
    expect(checkIntSize(Number.MAX_SAFE_INTEGER, false, 8)).toBe(true);
    expect(checkIntSize(Number.MAX_SAFE_INTEGER + 0.3, false, 8)).toBe(true);
    expect(checkIntSize(18446744073709551615n, false, 8)).toBe(true);
    expect(checkIntSize("18446744073709551615", false, 8)).toBe(true);
    expect(checkIntSize("18446744073709551615.3", false, 8)).toBe(true);

    expect(checkIntSize(-1, false, 8)).toBe(false);
    expect(checkIntSize(-1.3, false, 8)).toBe(false);
    expect(checkIntSize(-1n, false, 8)).toBe(false);
    expect(checkIntSize("-1", false, 8)).toBe(false);
    expect(checkIntSize("-1.3", false, 8)).toBe(false);

    expect(checkIntSize(Number.MAX_SAFE_INTEGER + 1, false, 8)).toBe(false);
    expect(checkIntSize(Number.MAX_SAFE_INTEGER + 1.3, false, 8)).toBe(false);
    expect(checkIntSize(18446744073709551616, false, 8)).toBe(false);
    expect(checkIntSize(18446744073709551616.3, false, 8)).toBe(false);
    expect(checkIntSize(18446744073709551616n, false, 8)).toBe(false);
    expect(checkIntSize("18446744073709551616", false, 8)).toBe(false);
    expect(checkIntSize("18446744073709551616.3", false, 8)).toBe(false);
});

test("checkIntBounds not parseable", () => {
    expect(checkIntSize(NaN, true, 1)).toBe(false);
    expect(checkIntSize(NaN, false, 1)).toBe(false);
    expect(checkIntSize(Infinity, true, 1)).toBe(false);
    expect(checkIntSize(Infinity, false, 1)).toBe(false);
    expect(checkIntSize(-Infinity, true, 1)).toBe(false);
    expect(checkIntSize(-Infinity, false, 1)).toBe(false);
    expect(checkIntSize("No number", false, 1)).toBe(false);

    expect(checkIntSize(NaN, true, 2)).toBe(false);
    expect(checkIntSize(NaN, false, 2)).toBe(false);
    expect(checkIntSize(Infinity, true, 2)).toBe(false);
    expect(checkIntSize(Infinity, false, 2)).toBe(false);
    expect(checkIntSize(-Infinity, true, 2)).toBe(false);
    expect(checkIntSize(-Infinity, false, 2)).toBe(false);
    expect(checkIntSize("No number", false, 2)).toBe(false);

    expect(checkIntSize(NaN, true, 4)).toBe(false);
    expect(checkIntSize(NaN, false, 4)).toBe(false);
    expect(checkIntSize(Infinity, true, 4)).toBe(false);
    expect(checkIntSize(Infinity, false, 4)).toBe(false);
    expect(checkIntSize(-Infinity, true, 4)).toBe(false);
    expect(checkIntSize(-Infinity, false, 4)).toBe(false);
    expect(checkIntSize("No number", false, 4)).toBe(false);

    expect(checkIntSize(NaN, true, 8)).toBe(false);
    expect(checkIntSize(NaN, false, 8)).toBe(false);
    expect(checkIntSize(Infinity, true, 8)).toBe(false);
    expect(checkIntSize(Infinity, false, 8)).toBe(false);
    expect(checkIntSize(-Infinity, true, 8)).toBe(false);
    expect(checkIntSize(-Infinity, false, 8)).toBe(false);
    expect(checkIntSize("No number", false, 8)).toBe(false);
});
