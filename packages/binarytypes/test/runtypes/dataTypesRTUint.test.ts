// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import {
    rtUINT8,
    rtUINT16,
    rtUINT32,
    rtUINT64,
} from "../../src/datatypeRuntypes";

test("Validation UINT8", () => {
    expect(() => {
        rtUINT8.check(Buffer.alloc(1));
    }).not.toThrow();
    expect(() => {
        rtUINT8.check(Buffer.alloc(0));
    }).toThrow();
    expect(() => {
        rtUINT8.check(Buffer.alloc(2));
    }).toThrow();

    expect(() => {
        rtUINT8.check(255);
    }).not.toThrow();
    expect(() => {
        rtUINT8.check(255.3);
    }).not.toThrow();
    expect(() => {
        rtUINT8.check(0);
    }).not.toThrow();
    expect(() => {
        rtUINT8.check(0.3);
    }).not.toThrow();
    expect(() => {
        rtUINT8.check(256);
    }).toThrow();
    expect(() => {
        rtUINT8.check(256.3);
    }).toThrow();
    expect(() => {
        rtUINT8.check(-1);
    }).toThrow();
    expect(() => {
        rtUINT8.check(-0.3);
    }).not.toThrow();

    expect(() => {
        rtUINT8.check(255n);
    }).not.toThrow();
    expect(() => {
        rtUINT8.check(0n);
    }).not.toThrow();
    expect(() => {
        rtUINT8.check(256n);
    }).toThrow();
    expect(() => {
        rtUINT8.check(-1n);
    }).toThrow();

    expect(() => {
        rtUINT8.check("255");
    }).not.toThrow();
    expect(() => {
        rtUINT8.check("255.3");
    }).not.toThrow();
    expect(() => {
        rtUINT8.check("0");
    }).not.toThrow();
    expect(() => {
        rtUINT8.check("0.3");
    }).not.toThrow();
    expect(() => {
        rtUINT8.check("256");
    }).toThrow();
    expect(() => {
        rtUINT8.check("256.3");
    }).toThrow();
    expect(() => {
        rtUINT8.check("-1");
    }).toThrow();
    expect(() => {
        rtUINT8.check("-0.3");
    }).not.toThrow();

    expect(() => {
        rtUINT8.check(NaN);
    }).toThrow();
    expect(() => {
        rtUINT8.check(Infinity);
    }).toThrow();
    expect(() => {
        rtUINT8.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtUINT8.check("no number");
    }).toThrow();
});

test("Validation UINT16", () => {
    expect(() => {
        rtUINT16.check(Buffer.alloc(2));
    }).not.toThrow();
    expect(() => {
        rtUINT16.check(Buffer.alloc(1));
    }).toThrow();
    expect(() => {
        rtUINT16.check(Buffer.alloc(3));
    }).toThrow();
    expect(() => {
        rtUINT16.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtUINT16.check(65535);
    }).not.toThrow();
    expect(() => {
        rtUINT16.check(65535.3);
    }).not.toThrow();
    expect(() => {
        rtUINT16.check(0);
    }).not.toThrow();
    expect(() => {
        rtUINT16.check(0.3);
    }).not.toThrow();
    expect(() => {
        rtUINT16.check(65536);
    }).toThrow();
    expect(() => {
        rtUINT16.check(65536.3);
    }).toThrow();
    expect(() => {
        rtUINT16.check(-1);
    }).toThrow();
    expect(() => {
        rtUINT16.check(-0.3);
    }).not.toThrow();

    expect(() => {
        rtUINT16.check(65535n);
    }).not.toThrow();
    expect(() => {
        rtUINT16.check(0n);
    }).not.toThrow();
    expect(() => {
        rtUINT16.check(65536n);
    }).toThrow();
    expect(() => {
        rtUINT16.check(-1n);
    }).toThrow();

    expect(() => {
        rtUINT16.check("65535");
    }).not.toThrow();
    expect(() => {
        rtUINT16.check("65535.3");
    }).not.toThrow();
    expect(() => {
        rtUINT16.check("0");
    }).not.toThrow();
    expect(() => {
        rtUINT16.check("0.3");
    }).not.toThrow();
    expect(() => {
        rtUINT16.check("65536");
    }).toThrow();
    expect(() => {
        rtUINT16.check("65536.3");
    }).toThrow();
    expect(() => {
        rtUINT16.check("-1");
    }).toThrow();
    expect(() => {
        rtUINT16.check("-0.3");
    }).not.toThrow();

    expect(() => {
        rtUINT16.check(NaN);
    }).toThrow();
    expect(() => {
        rtUINT16.check(Infinity);
    }).toThrow();
    expect(() => {
        rtUINT16.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtUINT16.check("no number");
    }).toThrow();
});

test("Validation UINT32", () => {
    expect(() => {
        rtUINT32.check(Buffer.alloc(4));
    }).not.toThrow();
    expect(() => {
        rtUINT32.check(Buffer.alloc(3));
    }).toThrow();
    expect(() => {
        rtUINT32.check(Buffer.alloc(5));
    }).toThrow();
    expect(() => {
        rtUINT32.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtUINT32.check(4294967295);
    }).not.toThrow();
    expect(() => {
        rtUINT32.check(4294967295.3);
    }).not.toThrow();
    expect(() => {
        rtUINT32.check(0);
    }).not.toThrow();
    expect(() => {
        rtUINT32.check(0.3);
    }).not.toThrow();
    expect(() => {
        rtUINT32.check(4294967296);
    }).toThrow();
    expect(() => {
        rtUINT32.check(4294967296.3);
    }).toThrow();
    expect(() => {
        rtUINT32.check(-1);
    }).toThrow();
    expect(() => {
        rtUINT32.check(-0.3);
    }).not.toThrow();

    expect(() => {
        rtUINT32.check(4294967295n);
    }).not.toThrow();
    expect(() => {
        rtUINT32.check(0n);
    }).not.toThrow();
    expect(() => {
        rtUINT32.check(4294967296n);
    }).toThrow();
    expect(() => {
        rtUINT32.check(-1n);
    }).toThrow();

    expect(() => {
        rtUINT32.check("4294967295");
    }).not.toThrow();
    expect(() => {
        rtUINT32.check("4294967295.3");
    }).not.toThrow();
    expect(() => {
        rtUINT32.check("0");
    }).not.toThrow();
    expect(() => {
        rtUINT32.check("0.3");
    }).not.toThrow();
    expect(() => {
        rtUINT32.check("4294967296");
    }).toThrow();
    expect(() => {
        rtUINT32.check("4294967296.3");
    }).toThrow();
    expect(() => {
        rtUINT32.check("-1");
    }).toThrow();
    expect(() => {
        rtUINT32.check("-0.3");
    }).not.toThrow();

    expect(() => {
        rtUINT32.check(NaN);
    }).toThrow();
    expect(() => {
        rtUINT32.check(Infinity);
    }).toThrow();
    expect(() => {
        rtUINT32.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtUINT32.check("no number");
    }).toThrow();
});

test("Validation UINT64", () => {
    expect(() => {
        rtUINT64.check(Buffer.alloc(8));
    }).not.toThrow();
    expect(() => {
        rtUINT64.check(Buffer.alloc(7));
    }).toThrow();
    expect(() => {
        rtUINT64.check(Buffer.alloc(9));
    }).toThrow();
    expect(() => {
        rtUINT64.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtUINT64.check(Number.MAX_SAFE_INTEGER);
    }).not.toThrow();
    expect(() => {
        rtUINT64.check(Number.MAX_SAFE_INTEGER + 0.3);
    }).not.toThrow();
    expect(() => {
        rtUINT64.check(0);
    }).not.toThrow();
    expect(() => {
        rtUINT64.check(0.3);
    }).not.toThrow();
    expect(() => {
        rtUINT64.check(Number.MAX_SAFE_INTEGER + 1);
    }).toThrow();
    expect(() => {
        rtUINT64.check(Number.MAX_SAFE_INTEGER + 1.3);
    }).toThrow();
    expect(() => {
        rtUINT64.check(-1);
    }).toThrow();
    expect(() => {
        rtUINT64.check(-0.3);
    }).not.toThrow();

    expect(() => {
        rtUINT64.check(18446744073709551615n);
    }).not.toThrow();
    expect(() => {
        rtUINT64.check(0);
    }).not.toThrow();
    expect(() => {
        rtUINT64.check(18446744073709551616n);
    }).toThrow();
    expect(() => {
        rtUINT64.check(-1n);
    }).toThrow();

    expect(() => {
        rtUINT64.check("18446744073709551615");
    }).not.toThrow();
    expect(() => {
        rtUINT64.check("18446744073709551615.3");
    }).not.toThrow();
    expect(() => {
        rtUINT64.check("0");
    }).not.toThrow();
    expect(() => {
        rtUINT64.check("0.3");
    }).not.toThrow();
    expect(() => {
        rtUINT64.check("18446744073709551616");
    }).toThrow();
    expect(() => {
        rtUINT64.check("18446744073709551616.3");
    }).toThrow();
    expect(() => {
        rtUINT64.check("-1");
    }).toThrow();
    expect(() => {
        rtUINT64.check("-0.3");
    }).not.toThrow();

    expect(() => {
        rtUINT64.check(NaN);
    }).toThrow();
    expect(() => {
        rtUINT64.check(Infinity);
    }).toThrow();
    expect(() => {
        rtUINT64.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtUINT64.check("no number");
    }).toThrow();
});
