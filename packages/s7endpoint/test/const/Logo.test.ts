// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { checkItemUniqueness } from "@woifes/util";
import { LOGO_ADDRESSES } from "../../src/const";

it("should have only UINT8 UINT16 or BIT type", () => {
    const addressRegEx = /^DB1,[X|W|B][0-9|.]+$/;
    for (const value of Object.values(LOGO_ADDRESSES)) {
        expect(value).toMatch(addressRegEx);
    }
});

it("should have unique addresses", () => {
    const keys = Object.keys(LOGO_ADDRESSES);
    const values = Object.values(LOGO_ADDRESSES);
    expect(checkItemUniqueness(keys)).toBe(true);
    expect(checkItemUniqueness(values)).toBe(true);
});
