// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { tS7Address } from "../../src/types/S7Address";
import { getS7AddrSize } from "../../src/util/getS7AddrSize";

let testVar: tS7Address;

beforeEach(() => {
    testVar = {
        area: "M",
        byteIndex: 1,
        type: "INT16",
    };
});

it("should give size 1 for BIT", () => {
    testVar.type = "BIT";
    testVar.bitIndex = 0;
    expect(getS7AddrSize(testVar)).toBe(1);
});

it("should give size 1 for ARRAY_OF_BIT in one byte", () => {
    testVar.type = "BIT";
    testVar.bitIndex = 3;
    testVar.count = 3;
    expect(getS7AddrSize(testVar)).toBe(1);

    testVar.bitIndex = 7;
    testVar.count = 1;
    expect(getS7AddrSize(testVar)).toBe(1);

    testVar.bitIndex = 0;
    testVar.count = 8;
    expect(getS7AddrSize(testVar)).toBe(1);
});

it("should give size > 1 for BIT_ARRAY over one byte", () => {
    testVar.type = "BIT";
    testVar.bitIndex = 7;
    testVar.count = 2;
    expect(getS7AddrSize(testVar)).toBe(2);

    testVar.bitIndex = 0;
    testVar.count = 16;
    expect(getS7AddrSize(testVar)).toBe(2);
});

it("should give the size for other types (not arrays)", () => {
    testVar.type = "UINT8";
    expect(getS7AddrSize(testVar)).toBe(1);
    testVar.type = "INT16";
    expect(getS7AddrSize(testVar)).toBe(2);
    testVar.type = "FLOAT";
    expect(getS7AddrSize(testVar)).toBe(4);
    testVar.type = "INT64";
    expect(getS7AddrSize(testVar)).toBe(8);
});

it("should give count * size for array vars", () => {
    testVar.type = "INT8";
    testVar.count = 5;
    expect(getS7AddrSize(testVar)).toBe(5);

    testVar.type = "INT64";
    testVar.count = 5;
    expect(getS7AddrSize(testVar)).toBe(40);
});
