// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtINT16, rtINT32, rtINT64, rtINT8 } from "../../src/datatypeRuntypes";

test("Validation INT8", () => {
    expect(() => {
        rtINT8.check(Buffer.alloc(1));
    }).not.toThrow();
    expect(() => {
        rtINT8.check(Buffer.alloc(0));
    }).toThrow();
    expect(() => {
        rtINT8.check(Buffer.alloc(2));
    }).toThrow();
    expect(() => {
        rtINT8.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtINT8.check(127);
    }).not.toThrow();
    expect(() => {
        rtINT8.check(127.3);
    }).not.toThrow();
    expect(() => {
        rtINT8.check(-128);
    }).not.toThrow();
    expect(() => {
        rtINT8.check(-128.3);
    }).not.toThrow();
    expect(() => {
        rtINT8.check(128);
    }).toThrow();
    expect(() => {
        rtINT8.check(128.3);
    }).toThrow();
    expect(() => {
        rtINT8.check(-129);
    }).toThrow();
    expect(() => {
        rtINT8.check(-129.3);
    }).toThrow();

    expect(() => {
        rtINT8.check(127n);
    }).not.toThrow();
    expect(() => {
        rtINT8.check(-128n);
    }).not.toThrow();
    expect(() => {
        rtINT8.check(128n);
    }).toThrow();
    expect(() => {
        rtINT8.check(-129n);
    }).toThrow();

    expect(() => {
        rtINT8.check("127");
    }).not.toThrow();
    expect(() => {
        rtINT8.check("127.3");
    }).not.toThrow();
    expect(() => {
        rtINT8.check("-128");
    }).not.toThrow();
    expect(() => {
        rtINT8.check("-128.3");
    }).not.toThrow();
    expect(() => {
        rtINT8.check("128");
    }).toThrow();
    expect(() => {
        rtINT8.check("128.3");
    }).toThrow();
    expect(() => {
        rtINT8.check("-129");
    }).toThrow();
    expect(() => {
        rtINT8.check("-129.3");
    }).toThrow();

    expect(() => {
        rtINT8.check(NaN);
    }).toThrow();
    expect(() => {
        rtINT8.check(Infinity);
    }).toThrow();
    expect(() => {
        rtINT8.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtINT8.check("no number");
    }).toThrow();
});

test("Validation INT16", () => {
    expect(() => {
        rtINT16.check(Buffer.alloc(2));
    }).not.toThrow();
    expect(() => {
        rtINT16.check(Buffer.alloc(1));
    }).toThrow();
    expect(() => {
        rtINT16.check(Buffer.alloc(3));
    }).toThrow();
    expect(() => {
        rtINT16.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtINT16.check(32767);
    }).not.toThrow();
    expect(() => {
        rtINT16.check(32767.3);
    }).not.toThrow();
    expect(() => {
        rtINT16.check(-32768);
    }).not.toThrow();
    expect(() => {
        rtINT16.check(-32768.3);
    }).not.toThrow();
    expect(() => {
        rtINT16.check(32768);
    }).toThrow();
    expect(() => {
        rtINT16.check(32768.3);
    }).toThrow();
    expect(() => {
        rtINT16.check(-32769);
    }).toThrow();
    expect(() => {
        rtINT16.check(-32769.3);
    }).toThrow();

    expect(() => {
        rtINT16.check(32767n);
    }).not.toThrow();
    expect(() => {
        rtINT16.check(-32768n);
    }).not.toThrow();
    expect(() => {
        rtINT16.check(32768n);
    }).toThrow();
    expect(() => {
        rtINT16.check(-32769n);
    }).toThrow();

    expect(() => {
        rtINT16.check("32767");
    }).not.toThrow();
    expect(() => {
        rtINT16.check("32767.3");
    }).not.toThrow();
    expect(() => {
        rtINT16.check("-32768");
    }).not.toThrow();
    expect(() => {
        rtINT16.check("-32768.3");
    }).not.toThrow();
    expect(() => {
        rtINT16.check("32768");
    }).toThrow();
    expect(() => {
        rtINT16.check("32768.3");
    }).toThrow();
    expect(() => {
        rtINT16.check("-32769");
    }).toThrow();
    expect(() => {
        rtINT16.check("-32769.3");
    }).toThrow();

    expect(() => {
        rtINT16.check(NaN);
    }).toThrow();
    expect(() => {
        rtINT16.check(Infinity);
    }).toThrow();
    expect(() => {
        rtINT16.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtINT16.check("no number");
    }).toThrow();
});

test("Validation INT32", () => {
    expect(() => {
        rtINT32.check(Buffer.alloc(4));
    }).not.toThrow();
    expect(() => {
        rtINT32.check(Buffer.alloc(3));
    }).toThrow();
    expect(() => {
        rtINT32.check(Buffer.alloc(5));
    }).toThrow();
    expect(() => {
        rtINT32.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtINT32.check(2147483647);
    }).not.toThrow();
    expect(() => {
        rtINT32.check(2147483647.3);
    }).not.toThrow();
    expect(() => {
        rtINT32.check(-2147483648);
    }).not.toThrow();
    expect(() => {
        rtINT32.check(-2147483648.3);
    }).not.toThrow();
    expect(() => {
        rtINT32.check(2147483648);
    }).toThrow();
    expect(() => {
        rtINT32.check(2147483648.3);
    }).toThrow();
    expect(() => {
        rtINT32.check(-2147483649);
    }).toThrow();
    expect(() => {
        rtINT32.check(-2147483649.3);
    }).toThrow();

    expect(() => {
        rtINT32.check(2147483647n);
    }).not.toThrow();
    expect(() => {
        rtINT32.check(-2147483648n);
    }).not.toThrow();
    expect(() => {
        rtINT32.check(2147483648n);
    }).toThrow();
    expect(() => {
        rtINT32.check(-2147483649n);
    }).toThrow();

    expect(() => {
        rtINT32.check("2147483647");
    }).not.toThrow();
    expect(() => {
        rtINT32.check("2147483647.3");
    }).not.toThrow();
    expect(() => {
        rtINT32.check("-2147483648");
    }).not.toThrow();
    expect(() => {
        rtINT32.check("-2147483648.3");
    }).not.toThrow();
    expect(() => {
        rtINT32.check("2147483648");
    }).toThrow();
    expect(() => {
        rtINT32.check("2147483648.3");
    }).toThrow();
    expect(() => {
        rtINT32.check("-2147483649");
    }).toThrow();
    expect(() => {
        rtINT32.check("-2147483649.3");
    }).toThrow();

    expect(() => {
        rtINT32.check(NaN);
    }).toThrow();
    expect(() => {
        rtINT32.check(Infinity);
    }).toThrow();
    expect(() => {
        rtINT32.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtINT32.check("no number");
    }).toThrow();
});

test("Validation INT64", () => {
    expect(() => {
        rtINT64.check(Buffer.alloc(8));
    }).not.toThrow();
    expect(() => {
        rtINT64.check(Buffer.alloc(7));
    }).toThrow();
    expect(() => {
        rtINT64.check(Buffer.alloc(9));
    }).toThrow();
    expect(() => {
        rtINT64.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtINT64.check(Number.MAX_SAFE_INTEGER);
    }).not.toThrow();
    expect(() => {
        rtINT64.check(Number.MAX_SAFE_INTEGER + 0.3);
    }).not.toThrow();
    expect(() => {
        rtINT64.check(Number.MIN_SAFE_INTEGER);
    }).not.toThrow();
    expect(() => {
        rtINT64.check(Number.MIN_SAFE_INTEGER - 0.3);
    }).not.toThrow();
    expect(() => {
        rtINT64.check(Number.MAX_SAFE_INTEGER + 1);
    }).toThrow();
    expect(() => {
        rtINT64.check(Number.MAX_SAFE_INTEGER + 1.3);
    }).toThrow();
    expect(() => {
        rtINT64.check(Number.MIN_SAFE_INTEGER - 1);
    }).toThrow();
    expect(() => {
        rtINT64.check(Number.MIN_SAFE_INTEGER - 1.3);
    }).toThrow();

    expect(() => {
        rtINT64.check(9223372036854775807n);
    }).not.toThrow();
    expect(() => {
        rtINT64.check(-9223372036854775808n);
    }).not.toThrow();
    expect(() => {
        rtINT64.check(9223372036854775808n);
    }).toThrow();
    expect(() => {
        rtINT64.check(-9223372036854775809n);
    }).toThrow();

    expect(() => {
        rtINT64.check("9223372036854775807");
    }).not.toThrow();
    expect(() => {
        rtINT64.check("9223372036854775807.3");
    }).not.toThrow();
    expect(() => {
        rtINT64.check("-9223372036854775808");
    }).not.toThrow();
    expect(() => {
        rtINT64.check("-9223372036854775808.3");
    }).not.toThrow();
    expect(() => {
        rtINT64.check("9223372036854775808");
    }).toThrow();
    expect(() => {
        rtINT64.check("9223372036854775808.3");
    }).toThrow();
    expect(() => {
        rtINT64.check("-9223372036854775809");
    }).toThrow();
    expect(() => {
        rtINT64.check("-9223372036854775809.3");
    }).toThrow();

    expect(() => {
        rtINT64.check(NaN);
    }).toThrow();
    expect(() => {
        rtINT64.check(Infinity);
    }).toThrow();
    expect(() => {
        rtINT64.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtINT64.check("no number");
    }).toThrow();
});
