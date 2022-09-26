// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtARRAY_OF_DOUBLE, rtDOUBLE } from "../../src/datatypeRuntypes";

test("Validation FLOAT", () => {
    expect(() => {
        rtDOUBLE.check(Buffer.alloc(8));
    }).not.toThrow();
    expect(() => {
        rtDOUBLE.check(Buffer.alloc(7));
    }).toThrow();
    expect(() => {
        rtDOUBLE.check(Buffer.alloc(9));
    }).toThrow();
    expect(() => {
        rtDOUBLE.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtDOUBLE.check(Number.MAX_SAFE_INTEGER + 1);
    }).not.toThrow();
    expect(() => {
        rtDOUBLE.check(Number.MIN_SAFE_INTEGER - 1);
    }).not.toThrow();

    expect(() => {
        rtDOUBLE.check(18446744073709551615n * 2n);
    }).not.toThrow();
    expect(() => {
        rtDOUBLE.check(-18446744073709551615n * 2n);
    }).not.toThrow();

    expect(() => {
        rtDOUBLE.check("184467440737095516150");
    }).not.toThrow();
    expect(() => {
        rtDOUBLE.check("-184467440737095516150");
    }).not.toThrow();

    expect(() => {
        rtDOUBLE.check(NaN);
    }).toThrow();
    expect(() => {
        rtDOUBLE.check(Infinity);
    }).toThrow();
    expect(() => {
        rtDOUBLE.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtDOUBLE.check("no number");
    }).toThrow();
});

test("Validation ARRAY_OF_FLOAT", () => {
    expect(() => {
        rtARRAY_OF_DOUBLE.check(Buffer.alloc(32));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_DOUBLE.check(Buffer.alloc(31));
    }).toThrow();
    expect(() => {
        rtARRAY_OF_DOUBLE.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_DOUBLE.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            10,
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_DOUBLE.check([
            Number.MAX_SAFE_INTEGER + 1,
            Number.MIN_SAFE_INTEGER,
            10,
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_DOUBLE.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER - 1,
            10,
        ]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_DOUBLE.check([
            18446744073709551615n * 2n,
            -18446744073709551615n * 2n,
            10n,
        ]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_DOUBLE.check([
            "184467440737095516150",
            "-184467440737095516150",
            "10",
        ]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_DOUBLE.check([
            Number.MAX_SAFE_INTEGER + 1,
            Number.MIN_SAFE_INTEGER,
            18446744073709551615n * 2n,
            -18446744073709551615n * 2n,
            "184467440737095516150",
            "-184467440737095516150",
            Buffer.alloc(8),
        ]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_DOUBLE.check([
            Number.MAX_SAFE_INTEGER + 1,
            Number.MIN_SAFE_INTEGER,
            18446744073709551615n * 2n,
            -18446744073709551615n * 2n,
            "184467440737095516150",
            "-184467440737095516150",
            Buffer.alloc(8),
        ]);
    }).not.toThrow();
});
