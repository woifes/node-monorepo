// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { checkItemUniqueness } from "../src/checkItemUniqueness";

describe("primitive types", () => {
    it("should find dublicate in number array", () => {
        let a = [1, 2, 3, 4, 5, 6];
        expect(checkItemUniqueness(a)).toBe(true);

        a = [1, 2, 3, 2, 5, 6];
        expect(checkItemUniqueness(a)).toBe(false);
    });

    it("should find dublicate in number array with compare function", () => {
        let a = [1, 2, 3];
        expect(
            checkItemUniqueness(a, (n) => {
                return n % 3;
            }),
        ).toBe(true);

        a = [1, 2, 3, 2, 5, 6];
        expect(
            checkItemUniqueness(a, (n) => {
                return n % 3;
            }),
        ).toBe(false);
    });
});

describe("object types", () => {
    it("should detect reference duplicate", () => {
        const o1 = {};
        const o2 = {};
        let o3 = {};
        let a = [o1, o2, o3];
        expect(checkItemUniqueness(a)).toBe(true);

        o3 = o1;
        a = [o1, o2, o3];
        expect(checkItemUniqueness(a)).toBe(false);
    });

    it("should detect duplicate with compare function", () => {
        const o1 = { prop: 1 };
        const o2 = { prop: 2 };
        const o3 = { prop: 3 };
        const a = [o1, o2, o3];
        expect(
            checkItemUniqueness(a, (o) => {
                return o.prop;
            }),
        ).toBe(true);

        o3.prop = 1;
        expect(
            checkItemUniqueness(a, (o) => {
                return o.prop;
            }),
        ).toBe(false);
    });
});
