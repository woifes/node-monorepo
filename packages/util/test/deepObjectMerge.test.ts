// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { deepObjectMerge } from "../src/deepObjectMerge";

it("should merge simple objects", () => {
    const o1 = {
        a: 1,
        b: 2,
    };
    const o2 = {
        a: 10,
        c: -3,
    };
    expect(deepObjectMerge(o1, o2)).toEqual({
        a: 10,
        b: 2,
        c: -3,
    });
});

it("should merge nested object", () => {
    const o1 = {
        a: { x: 1, y: "abc" },
        b: 2,
    };
    const o2 = {
        a: { x: 10, z: "AA" },
        c: -3,
    };
    expect(deepObjectMerge(o1, o2)).toEqual({
        a: { x: 10, y: "abc", z: "AA" },
        b: 2,
        c: -3,
    });
});

it("should replace array of number or string", () => {
    const o1 = {
        a: [1, 2, 3],
        b: ["a", "b", "c"],
    };
    const o2 = {
        a: [10, 20, 30],
        b: ["AA", "BB", "CC"],
        c: -3,
    };
    expect(deepObjectMerge(o1, o2)).toEqual({
        a: [10, 20, 30],
        b: ["AA", "BB", "CC"],
        c: -3,
    });
});

it("should merge objects in array", () => {
    const o1 = {
        a: [
            { b: 1, c: "abc" },
            { b: 1, c: "abc" },
            { b: 1, c: "abc" },
        ],
    };
    const o2 = {
        a: [
            { b: 1, c: "abc", d: { e: 1, f: "abc" } },
            { b: 10 },
            7,
            { x: "a", y: 3 },
        ],
    };
    expect(deepObjectMerge(o1, o2)).toEqual({
        a: [
            { b: 1, c: "abc", d: { e: 1, f: "abc" } },
            { b: 10, c: "abc" },
            7,
            { x: "a", y: 3 },
        ],
    });
});
