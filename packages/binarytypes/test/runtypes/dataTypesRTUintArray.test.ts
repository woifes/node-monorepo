// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import {
    rtARRAY_OF_UINT16,
    rtARRAY_OF_UINT32,
    rtARRAY_OF_UINT64,
    rtARRAY_OF_UINT8,
} from "../../src/datatypeRuntypes";

/* eslint-disable @typescript-eslint/no-loss-of-precision */

test("Validation ARRAY_OF_UINT8", () => {
    expect(() => {
        rtARRAY_OF_UINT8.check(Buffer.alloc(7));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_UINT8.check('["255", "0", "10"]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check('["255.3", "0.3", "10"]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check('["256", "0", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check('["256.3", "0", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check('["255", "-1", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check('["255", "-0.3", "10"]');
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT8.check([255, 0, 10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([255.3, 0, 10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([256, 0, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([256.3, 0, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([255, -1, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([255, -0.3, 10]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT8.check([255n, 0n, 10n]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([256n, 0n, 10n]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([255n, -1n, 10n]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_UINT8.check(["255", "0", "10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check(["255.3", "0", "10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check(["256", "0", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check(["256.3", "0", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check(["255", "-1", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check(["255", "-0.3", "10"]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT8.check([255, 0, 255n, 0n, "255", "0", Buffer.alloc(1)]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([NaN, 0, 255n, 0n, "255", "0", Buffer.alloc(1)]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([
            255,
            Infinity,
            255n,
            0n,
            "255",
            "0",
            Buffer.alloc(1),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([
            255,
            0,
            -Infinity,
            0n,
            "255",
            "0",
            Buffer.alloc(1),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT8.check([
            255,
            0,
            255n,
            "no number",
            "255",
            "0",
            Buffer.alloc(1),
        ]);
    }).toThrow();
});

test("Validation ARRAY_OF_UINT16", () => {
    expect(() => {
        rtARRAY_OF_UINT16.check(Buffer.alloc(8));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check(Buffer.alloc(7));
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_UINT16.check('["65535", "0", "10"]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check('["65535.3", "0", "10"]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check('["65536", "0", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check('["65536.3", "0", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check('["65535", "-1", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check('["65535", "-0.3", "10"]');
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT16.check([65535, 0, 10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([65535.3, 0, 10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([65536, 0, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([65536.3, 0, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([65535, -1, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([65535, -0.3, 10]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT16.check([65535n, 0n, 10n]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([65536n, 0n, 10n]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([65535n, -1n, 10n]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_UINT16.check(["65535", "0", "10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check(["65535.3", "0", "10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check(["65536", "0", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check(["65536.3", "0", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check(["65535", "-1", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check(["65535", "-0.3", "10"]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT16.check([
            65535,
            0,
            65535n,
            0n,
            "65535",
            "0",
            Buffer.alloc(2),
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([
            NaN,
            0,
            65535n,
            0n,
            "65535",
            "0",
            Buffer.alloc(2),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([
            65535,
            Infinity,
            65535n,
            0n,
            "65535",
            "0",
            Buffer.alloc(2),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([
            65535,
            0,
            -Infinity,
            0n,
            "65535",
            "0",
            Buffer.alloc(2),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT16.check([
            65535,
            0,
            65535n,
            "no number",
            "65535",
            "0",
            Buffer.alloc(2),
        ]);
    }).toThrow();
});

test("Validation ARRAY_OF_UINT32", () => {
    expect(() => {
        rtARRAY_OF_UINT32.check(Buffer.alloc(16));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check(Buffer.alloc(15));
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_UINT32.check('["4294967295", "0", "10"]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check('["4294967295.3", "0", "10"]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check('["4294967296", "0", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check('["4294967296.3", "0", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check('["4294967295", "-1", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check('["4294967295", "-0.3", "10"]');
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT32.check([4294967295, 0, 10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([4294967295.3, 0, 10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([4294967296, 0, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([4294967296.3, 0, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([4294967295, -1, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([4294967295, -0.3, 10]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT32.check([4294967295n, 0n, 10n]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([4294967296n, 0n, 10n]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([4294967295n, -1n, 10n]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_UINT32.check(["4294967295", "0", "10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check(["4294967295.3", "0", "10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check(["4294967296", "0", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check(["4294967296.3", "0", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check(["4294967295", "-1", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check(["4294967295", "-0.3", "10"]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT32.check([
            4294967295,
            0,
            4294967295n,
            0n,
            "4294967295",
            "0",
            Buffer.alloc(4),
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([
            NaN,
            0,
            4294967295n,
            0n,
            "4294967295",
            "0",
            Buffer.alloc(4),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([
            4294967295,
            Infinity,
            4294967295n,
            0n,
            "4294967295",
            "0",
            Buffer.alloc(4),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([
            4294967295,
            0,
            -Infinity,
            0n,
            "4294967295",
            "0",
            Buffer.alloc(4),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT32.check([
            4294967295,
            0,
            4294967295n,
            "no number",
            "4294967295",
            "0",
            Buffer.alloc(4),
        ]);
    }).toThrow();
});

test("Validation ARRAY_OF_UINT64", () => {
    expect(() => {
        rtARRAY_OF_UINT64.check(Buffer.alloc(16));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check(Buffer.alloc(15));
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_UINT64.check('["18446744073709551615", "0", "10"]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check('["18446744073709551615.3", "0", "10"]');
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check('["18446744073709551616", "0", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check('["18446744073709551616.3", "0", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check('["18446744073709551615", "-1", "10"]');
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check('["18446744073709551615", "-0.3", "10"]');
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT64.check([Number.MAX_SAFE_INTEGER, 0, 10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([Number.MAX_SAFE_INTEGER + 0.3, 0, 10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([Number.MAX_SAFE_INTEGER + 1, 0, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([Number.MAX_SAFE_INTEGER + 1.3, 0, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([Number.MAX_SAFE_INTEGER, -1, 10]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([Number.MAX_SAFE_INTEGER, -0.3, 10]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            10,
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([
            Number.MAX_SAFE_INTEGER + 0.3,
            Number.MIN_SAFE_INTEGER - 0.3,
            10,
        ]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_UINT64.check([18446744073709551615n, 0n, 10n]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([18446744073709551616n, 0n, 10n]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([18446744073709551615n, -1n, 10n]);
    }).toThrow();

    expect(() => {
        rtARRAY_OF_UINT64.check(["18446744073709551615", "0", "10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check(["18446744073709551615.3", "0", "10"]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check(["18446744073709551616", "0", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check(["18446744073709551616.3", "0", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check(["18446744073709551615", "-1", "10"]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check(["18446744073709551615", "-0.3", "10"]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_UINT64.check([
            Number.MAX_SAFE_INTEGER,
            0,
            18446744073709551615n,
            0n,
            "18446744073709551615",
            "0",
            Buffer.alloc(8),
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([
            NaN,
            0,
            18446744073709551615,
            0n,
            "18446744073709551615",
            "0",
            Buffer.alloc(8),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([
            Number.MAX_SAFE_INTEGER,
            Infinity,
            18446744073709551615n,
            0n,
            "18446744073709551615",
            "0",
            Buffer.alloc(8),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([
            Number.MAX_SAFE_INTEGER,
            0,
            -Infinity,
            0n,
            "18446744073709551615",
            "0",
            Buffer.alloc(8),
        ]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_UINT64.check([
            Number.MAX_SAFE_INTEGER,
            0,
            18446744073709551615n,
            "no number",
            "18446744073709551615",
            "0",
            Buffer.alloc(8),
        ]);
    }).toThrow();
});
