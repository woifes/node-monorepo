// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import {
    rtARRAY_OF_INT16,
    rtARRAY_OF_INT32,
    rtARRAY_OF_INT64,
    rtARRAY_OF_INT8,
} from "../../src/datatypeRuntypes";

test("Validation ARRAY_OF_INT8", () => {
    expect(() => {
        rtARRAY_OF_INT8.check(Buffer.alloc(7));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT8.check('[ "127", "-128", "10", "-10" ]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check('[ "127.3", "-128.3", "10", "-10" ]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check('[ "128", "-128", "10", "-10" ]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check('[ "128.3", "-128", "10", "-10" ]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check('[ "127", "-129", "10", "-10" ]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check('[ "127", "-129.3", "10", "-10" ]');
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT8.check([127, -128, 10, -10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([127.3, -128.3, 10, -10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([128, -128, 10, -10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([128.3, -128, 10, -10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([127, -129, 10, -10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([127, -129.3, 10, -10]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT8.check([127n, -128n, 10n, -10n]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([128n, -128n, 10n, -10n]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([127n, -129n, 10n, -10n]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT8.check(["127", "-128", "10", "-10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check(["127.3", "-128.3", "10", "-10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check(["128", "-128", "10", "-10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check(["128.3", "-128", "10", "-10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check(["127", "-129", "10", "-10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check(["127", "-129.3", "10", "-10"]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT8.check([
            127,
            -128,
            127n,
            -128n,
            "127",
            "-128",
            Buffer.alloc(1),
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([
            NaN,
            -128,
            127n,
            -128n,
            "127",
            "-128",
            Buffer.alloc(1),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([
            127,
            Infinity,
            127n,
            -128n,
            "127",
            "-128",
            Buffer.alloc(1),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([
            127,
            -128,
            -Infinity,
            -128n,
            "127",
            "-128",
            Buffer.alloc(1),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT8.check([
            127,
            -128,
            127n,
            "no number",
            "127",
            "-128",
            Buffer.alloc(1),
        ]);
    }).toThrow();
});

test("Validation ARRAY_OF_INT16", () => {
    expect(() => {
        rtARRAY_OF_INT16.check(Buffer.alloc(8));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check(Buffer.alloc(7));
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT16.check('["32767", "-32768", "10", "-10"] ');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check('["32767.3", "-32768.3", "10", "-10"] ');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check('["32768", "-32768", "10", "-10"] ');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check('["32768.3", "-32768", "10", "-10"] ');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check('["32767", "-32769", "10", "-10"] ');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check('["32767", "-32769.3", "10", "-10"] ');
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT16.check([32767, -32768, 10, -10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([32767.3, -32768.3, 10, -10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([32768, -32768, 10, -10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([32768.3, -32768, 10, -10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([32767, -32769, 10, -10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([32767, -32769.3, 10, -10]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT16.check([32767n, -32768n, 10n, -10n]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([32768n, -32768n, 10n, -10n]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([32767n, -32769n, 10n, -10n]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT16.check(["32767", "-32768", "10", "-10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check(["32767.3", "-32768.3", "10", "-10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check(["32768", "-32768", "10", "-10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check(["32768.3", "-32768", "10", "-10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check(["32767", "-32769", "10", "-10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check(["32767", "-32769.3", "10", "-10"]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT16.check([
            32767,
            -32768,
            32767n,
            -32768n,
            "32767",
            "-32768",
            Buffer.alloc(2),
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([
            NaN,
            -32768,
            32767n,
            -32768n,
            "32767",
            "-32768",
            Buffer.alloc(2),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([
            32767,
            Infinity,
            32767n,
            -32768n,
            "32767",
            "-32768",
            Buffer.alloc(2),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([
            32767,
            -32768,
            -Infinity,
            -32768n,
            "32767",
            "-32768",
            Buffer.alloc(2),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT16.check([
            32767,
            -32768,
            32767n,
            "no number",
            "32767",
            "-32768",
            Buffer.alloc(2),
        ]);
    }).toThrow();
});

test("Validation ARRAY_OF_INT32", () => {
    expect(() => {
        rtARRAY_OF_INT32.check(Buffer.alloc(24));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(Buffer.alloc(23));
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT32.check(' ["2147483647", "-2147483648", "10", "-10" ]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(
            ' ["2147483647.3", "-2147483648.3", "10", "-10" ]'
        );
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(' ["2147483648", "-2147483648", "10", "-10" ]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(
            ' ["2147483648.3", "-2147483648", "10", "-10" ]'
        );
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(' ["2147483647", "-2147483649", "10", "-10" ]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(
            ' ["2147483647", "-2147483649.3", "10", "-10" ]'
        );
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT32.check([2147483647, -2147483648, 10, -10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([2147483647.3, -2147483648.3, 10, -10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([2147483648, -2147483648, 10, -10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([2147483648.3, -2147483648, 10, -10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([2147483647, -2147483649, 10, -10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([2147483647, -2147483649.3, 10, -10]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT32.check([2147483647n, -2147483648n, 10n, -10n]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([2147483648n, -2147483648n, 10n, -10n]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([2147483647n, -2147483649n, 10n, -10n]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT32.check(["2147483647", "-2147483648", "10", "-10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(["2147483647.3", "-2147483648.3", "10", "-10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(["2147483648", "-2147483648", "10", "-10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(["2147483648.3", "-2147483648", "10", "-10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(["2147483647", "-2147483649", "10", "-10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check(["2147483647", "-2147483649.3", "10", "-10"]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT32.check([
            2147483647,
            -2147483648,
            2147483647n,
            -2147483648n,
            "2147483647",
            "-2147483648",
            Buffer.alloc(4),
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([
            NaN,
            -2147483648,
            2147483647n,
            -2147483648n,
            "2147483647",
            "-2147483648",
            Buffer.alloc(4),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([
            2147483647,
            Infinity,
            2147483647n,
            -2147483648n,
            "2147483647",
            "-2147483648",
            Buffer.alloc(4),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([
            2147483647,
            -2147483648,
            -Infinity,
            -2147483648n,
            "2147483647",
            "-2147483648",
            Buffer.alloc(4),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT32.check([
            2147483647,
            -2147483648,
            2147483647n,
            "no number",
            "2147483647",
            "-2147483648",
            Buffer.alloc(4),
        ]);
    }).toThrow();
});

test("Validation ARRAY_OF_INT64", () => {
    expect(() => {
        rtARRAY_OF_INT64.check(Buffer.alloc(64));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check(Buffer.alloc(63));
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT64.check(
            `["9223372036854775807", "-9223372036854775808", "10", "-10"]`
        );
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check(
            `["9223372036854775807.3", "-9223372036854775808.3", "10", "-10"]`
        );
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check(
            `["9223372036854775808", "-9223372036854775808", "10", "-10"]`
        );
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check(
            `["9223372036854775808.3", "-9223372036854775808", "10", "-10"]`
        );
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check(
            `["9223372036854775807", "-9223372036854775809", "10", "-10"]`
        );
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check(
            `["9223372036854775807", "-9223372036854775809.3", "10", "-10"]`
        );
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            10,
            -10,
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER + 0.3,
            Number.MIN_SAFE_INTEGER - 0.3,
            10,
            -10,
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER + 1.3,
            Number.MIN_SAFE_INTEGER,
            10,
            -10,
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER + 1.3,
            Number.MIN_SAFE_INTEGER,
            10,
            -10,
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER - 1.3,
            10,
            -10,
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER - 1.3,
            10,
            -10,
        ]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT64.check([
            9223372036854775807n,
            -9223372036854775808n,
            10n,
            -10n,
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            9223372036854775808n,
            -9223372036854775808n,
            10n,
            -10n,
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            9223372036854775807n,
            -9223372036854775809n,
            10n,
            -10n,
        ]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT64.check([
            "9223372036854775807",
            "-9223372036854775808",
            "10",
            "-10",
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            "9223372036854775807.3",
            "-9223372036854775808.3",
            "10",
            "-10",
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            "9223372036854775808",
            "-9223372036854775808",
            "10",
            "-10",
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            "9223372036854775808.3",
            "-9223372036854775808",
            "10",
            "-10",
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            "9223372036854775807",
            "-9223372036854775809",
            "10",
            "-10",
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            "9223372036854775807",
            "-9223372036854775809.3",
            "10",
            "-10",
        ]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            9223372036854775807n,
            -9223372036854775808n,
            "9223372036854775807",
            "-9223372036854775808",
            Buffer.alloc(8),
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            NaN,
            -9223372036854775808,
            9223372036854775807n,
            -9223372036854775808n,
            "9223372036854775807",
            "-9223372036854775808",
            Buffer.alloc(8),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER,
            Infinity,
            9223372036854775807n,
            -9223372036854775808n,
            "9223372036854775807",
            "-9223372036854775808",
            Buffer.alloc(8),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            -Infinity,
            -9223372036854775808n,
            "9223372036854775807",
            "-9223372036854775808",
            Buffer.alloc(8),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_INT64.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            9223372036854775807n,
            "no number",
            "9223372036854775807",
            "-9223372036854775808",
            Buffer.alloc(8),
        ]);
    }).toThrow();
});
