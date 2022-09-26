// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtARRAY_OF_FLOAT, rtFLOAT } from "../../src/datatypeRuntypes";

test("Validation FLOAT", () => {
    expect(() => {
        rtFLOAT.check(Buffer.alloc(4));
    }).not.toThrow();
    expect(() => {
        rtFLOAT.check(Buffer.alloc(3));
    }).toThrow();
    expect(() => {
        rtFLOAT.check(Buffer.alloc(5));
    }).toThrow();
    expect(() => {
        rtFLOAT.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtFLOAT.check(Number.MAX_SAFE_INTEGER + 1);
    }).not.toThrow();
    expect(() => {
        rtFLOAT.check(Number.MIN_SAFE_INTEGER - 1);
    }).not.toThrow();

    expect(() => {
        rtFLOAT.check(18446744073709551615n * 2n);
    }).not.toThrow();
    expect(() => {
        rtFLOAT.check(-18446744073709551615n * 2n);
    }).not.toThrow();

    expect(() => {
        rtFLOAT.check("184467440737095516150");
    }).not.toThrow();
    expect(() => {
        rtFLOAT.check("-184467440737095516150");
    }).not.toThrow();

    expect(() => {
        rtFLOAT.check(NaN);
    }).toThrow();
    expect(() => {
        rtFLOAT.check(Infinity);
    }).toThrow();
    expect(() => {
        rtFLOAT.check(-Infinity);
    }).toThrow();
    expect(() => {
        rtFLOAT.check("no number");
    }).toThrow();
});

test("Validation ARRAY_OF_FLOAT", () => {
    expect(() => {
        rtARRAY_OF_FLOAT.check(Buffer.alloc(24));
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_FLOAT.check(Buffer.alloc(23));
    }).toThrow();
    expect(() => {
        rtARRAY_OF_FLOAT.check(Buffer.alloc(0));
    }).toThrow();

    expect(() => {
        rtARRAY_OF_FLOAT.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER,
            10,
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_FLOAT.check([
            Number.MAX_SAFE_INTEGER + 1,
            Number.MIN_SAFE_INTEGER,
            10,
        ]);
    }).not.toThrow();
    expect(() => {
        rtARRAY_OF_FLOAT.check([
            Number.MAX_SAFE_INTEGER,
            Number.MIN_SAFE_INTEGER - 1,
            10,
        ]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_FLOAT.check([
            18446744073709551615n * 2n,
            -18446744073709551615n * 2n,
            10n,
        ]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_FLOAT.check([
            "184467440737095516150",
            "-184467440737095516150",
            "10",
        ]);
    }).not.toThrow();

    expect(() => {
        rtARRAY_OF_FLOAT.check([
            Number.MAX_SAFE_INTEGER + 1,
            Number.MIN_SAFE_INTEGER,
            18446744073709551615n * 2n,
            -18446744073709551615n * 2n,
            "184467440737095516150",
            "-184467440737095516150",
            Buffer.alloc(4),
        ]);
    }).not.toThrow();
});
