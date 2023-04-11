// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { normalizeBigInt } from "../../src/checkInteger";

test("number", () => {
    expect(normalizeBigInt(1000.3)).toBe(1000n);
    expect(normalizeBigInt(-1000.3)).toBe(-1000n);

    expect(normalizeBigInt(1000)).toBe(1000n);
    expect(normalizeBigInt(-1000)).toBe(-1000n);

    expect(normalizeBigInt(Number.MAX_SAFE_INTEGER)).toBe(
        BigInt(Number.MAX_SAFE_INTEGER),
    );
    expect(normalizeBigInt(Number.MIN_SAFE_INTEGER)).toBe(
        BigInt(Number.MIN_SAFE_INTEGER),
    );

    expect(normalizeBigInt(Number.MAX_SAFE_INTEGER + 0.3)).toBe(
        BigInt(Number.MAX_SAFE_INTEGER),
    );
    expect(normalizeBigInt(Number.MIN_SAFE_INTEGER - 0.3)).toBe(
        BigInt(Number.MIN_SAFE_INTEGER),
    );

    expect(() => {
        normalizeBigInt(Number.MAX_SAFE_INTEGER + 1);
    }).toThrow();
    expect(() => {
        normalizeBigInt(Number.MIN_SAFE_INTEGER - 1);
    }).toThrow();

    expect(() => {
        normalizeBigInt(Number.MAX_SAFE_INTEGER + 1.3);
    }).toThrow();
    expect(() => {
        normalizeBigInt(Number.MIN_SAFE_INTEGER - 1.3);
    }).toThrow();
});

test("string", () => {
    expect(normalizeBigInt("1000")).toBe(1000n);
    expect(normalizeBigInt("+1000")).toBe(1000n);
    expect(normalizeBigInt("-1000")).toBe(-1000n);

    expect(normalizeBigInt("1000.3")).toBe(1000n);
    expect(normalizeBigInt("+1000.3")).toBe(1000n);
    expect(normalizeBigInt("-1000.3")).toBe(-1000n);

    expect(normalizeBigInt("1000FromHereNoNumber")).toBe(1000n);
    expect(normalizeBigInt("+1000FromHereNoNumber")).toBe(1000n);
    expect(normalizeBigInt("-1000FromHereNoNumber")).toBe(-1000n);

    expect(normalizeBigInt("1000.3.3")).toBe(1000n);
    expect(normalizeBigInt("+1000.3.3")).toBe(1000n);
    expect(normalizeBigInt("-1000.3.3")).toBe(-1000n);

    expect(() => {
        normalizeBigInt("No number");
    }).toThrow();
});

test("bigint", () => {
    expect(normalizeBigInt(1000n)).toBe(1000n);
    expect(normalizeBigInt(-1000n)).toBe(-1000n);
});
