// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { S7Address } from "../../src/types/S7Address";

it("should match correct object", () => {
    //minimal
    expect(() => {
        S7Address.check({
            area: "M",
            type: "UINT8",
            byteIndex: 1,
        });
    }).not.toThrow();

    //full
    expect(() => {
        S7Address.check({
            dbNr: 1,
            area: "DB",
            type: "BIT",
            byteIndex: 1,
            bitIndex: 2,
            count: 3,
        });
    }).not.toThrow();
});

describe("range errors", () => {
    it("should throw for wrong dbNr", () => {
        expect(() => {
            S7Address.check({
                dbNr: -1,
                area: "DB",
                type: "BIT",
                byteIndex: 1,
                bitIndex: 2,
                count: 3,
            });
        }).toThrow();
    });
    it("should throw for wrong byteIndex", () => {
        expect(() => {
            S7Address.check({
                dbNr: 1,
                area: "DB",
                type: "BIT",
                byteIndex: -1,
                bitIndex: 2,
                count: 3,
            });
        }).toThrow();
    });
    it("should throw for wrong count", () => {
        expect(() => {
            S7Address.check({
                dbNr: 1,
                area: "DB",
                type: "BIT",
                byteIndex: 1,
                bitIndex: 2,
                count: -1,
            });
        }).toThrow();
    });
    it("should throw for wrong bit range", () => {
        expect(() => {
            S7Address.check({
                dbNr: 1,
                area: "DB",
                type: "BIT",
                byteIndex: 1,
                bitIndex: 8,
                count: 3,
            });
        }).toThrow();
        expect(() => {
            S7Address.check({
                dbNr: 1,
                area: "DB",
                type: "BIT",
                byteIndex: 1,
                bitIndex: -1,
                count: 3,
            });
        }).toThrow();
    });
});

describe("constraint errors", () => {
    it("should throw if DB area has no dbNr", () => {
        expect(() => {
            S7Address.check({
                area: "DB",
                type: "BIT",
                byteIndex: 1,
                bitIndex: 2,
                count: 3,
            });
        }).toThrow();
    });
    it("should throw if BIT type has no bitIndex", () => {
        expect(() => {
            S7Address.check({
                dbNr: 1,
                area: "DB",
                type: "BIT",
                byteIndex: 1,
                count: 3,
            });
        }).toThrow();
    });
});
