// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtARRAY_OF_STRING, rtString } from "../../src/datatypeRuntypes";

test("validation of STRING", () => {
    //number
    expect(() => {
        rtString.check(123);
    }).toThrow();
    //number[]
    expect(() => {
        rtString.check([1, 2, 3, -1, -2, -3]);
    }).toThrow();
    expect(() => {
        rtString.check([NaN, 2, 3, -1, -2, -3]);
    }).toThrow();
    expect(() => {
        rtString.check([1, Infinity, 3, -1, -2, -3]);
    }).toThrow();
    expect(() => {
        rtString.check([1, 2, -Infinity, -1, -2, -3]);
    }).toThrow();
    //bigint
    expect(() => {
        rtString.check(123n);
    }).toThrow();
    //bigint[]
    expect(() => {
        rtString.check([1n, 2n, 3n, -1n, -2n, -3n]);
    }).toThrow();
    //Buffer
    expect(() => {
        rtString.check(Buffer.alloc(123));
    }).not.toThrow();
    //Buffer[]
    expect(() => {
        rtString.check([
            Buffer.alloc(7),
            Buffer.alloc(7),
            Buffer.alloc(7),
            Buffer.alloc(7),
        ]);
    }).toThrow();
    //String
    expect(() => {
        rtString.check("I am a string");
    }).not.toThrow();
    //String[]
    expect(() => {
        rtString.check(["I", "am", "a", "string", "array"]);
    }).toThrow();
});

test("validation of ARRAY_OF_STRING", () => {
    //number
    expect(() => {
        rtARRAY_OF_STRING.check(123);
    }).toThrow();
    //number[]
    expect(() => {
        rtARRAY_OF_STRING.check([1, 2, 3, -1, -2, -3]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_STRING.check([NaN, 2, 3, -1, -2, -3]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_STRING.check([1, Infinity, 3, -1, -2, -3]);
    }).toThrow();
    expect(() => {
        rtARRAY_OF_STRING.check([1, 2, -Infinity, -1, -2, -3]);
    }).toThrow();
    //bigint
    expect(() => {
        rtARRAY_OF_STRING.check(123n);
    }).toThrow();
    //bigint[]
    expect(() => {
        rtARRAY_OF_STRING.check([1n, 2n, 3n, -1n, -2n, -3n]);
    }).toThrow();
    //Buffer
    expect(() => {
        rtARRAY_OF_STRING.check(Buffer.alloc(123));
    }).toThrow();
    expect(() => {
        rtARRAY_OF_STRING.check(
            Buffer.from('["I", "am", "a", "string", "array"]', "ascii")
        );
    }).not.toThrow();
    //Buffer[]
    expect(() => {
        rtARRAY_OF_STRING.check([
            Buffer.alloc(7),
            Buffer.alloc(7),
            Buffer.alloc(7),
            Buffer.alloc(7),
        ]);
    }).toThrow();
    //String
    expect(() => {
        rtARRAY_OF_STRING.check("I am a string");
    }).toThrow();
    expect(() => {
        rtARRAY_OF_STRING.check('["I", "am", "a", "string", "array"]');
    }).not.toThrow();
    //String[]
    expect(() => {
        rtARRAY_OF_STRING.check(["I", "am", "a", "string", "array"]);
    }).not.toThrow();
});
