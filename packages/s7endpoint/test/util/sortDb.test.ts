// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { tS7Address } from "../../src/types/S7Address";
import { sortDbAddresses, sortS7Addresses } from "../../src/util/sortDb";

describe("sort db tests", () => {
    it("should sort correctly", () => {
        const testArray: tS7Address[] = [
            { area: "DB", dbNr: 5, byteIndex: 123, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 41, type: "INT16" },
            { area: "DB", dbNr: 4, byteIndex: 17, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 30, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 40, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 20, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 10, type: "INT16" },
            { area: "DB", dbNr: 2, byteIndex: 1, type: "INT16" },
            { area: "DB", dbNr: 1, byteIndex: 1, type: "INT16" },
        ];
        expect(testArray.sort(sortDbAddresses)).toEqual([
            { area: "DB", dbNr: 1, byteIndex: 1, type: "INT16" },
            { area: "DB", dbNr: 2, byteIndex: 1, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 10, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 20, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 30, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 40, type: "INT16" },
            { area: "DB", dbNr: 3, byteIndex: 41, type: "INT16" },
            { area: "DB", dbNr: 4, byteIndex: 17, type: "INT16" },
            { area: "DB", dbNr: 5, byteIndex: 123, type: "INT16" },
        ]);
    });
});

describe("sort s7 adresses tests", () => {
    it("should sort correctly", () => {
        const testArray: tS7Address[] = [
            { area: "M", type: "UINT8", byteIndex: 5 },
            { area: "M", type: "UINT8", byteIndex: 3 },
            { area: "M", type: "UINT8", byteIndex: 4 },
            { area: "M", type: "UINT8", byteIndex: 3 },
            { area: "M", type: "UINT8", byteIndex: 1 },
        ];
        expect(testArray.sort(sortS7Addresses)).toEqual([
            { area: "M", type: "UINT8", byteIndex: 1 },
            { area: "M", type: "UINT8", byteIndex: 3 },
            { area: "M", type: "UINT8", byteIndex: 3 },
            { area: "M", type: "UINT8", byteIndex: 4 },
            { area: "M", type: "UINT8", byteIndex: 5 },
        ]);
    });
});
