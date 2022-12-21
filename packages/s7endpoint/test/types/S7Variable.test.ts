// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { S7Variable, tS7Variable } from "../../src/types/S7Variable";

let testVar: tS7Variable;

beforeEach(() => {
    testVar = {
        dbNr: 1,
        area: "DB",
        type: "BIT",
        byteIndex: 1,
        bitIndex: 2,
    };
});

describe("value constraint tests", () => {
    describe("BIT value tests", () => {
        beforeEach(() => {
            testVar.type = "BIT";
            testVar.bitIndex = 0;
        });

        it("should allow value 0, 1 and 2", () => {
            testVar.value = 0;
            expect(() => {
                S7Variable.check(testVar);
            }).not.toThrow();
            testVar.value = 1;
            expect(() => {
                S7Variable.check(testVar);
            }).not.toThrow();
            testVar.value = 2;
            expect(() => {
                S7Variable.check(testVar);
            }).not.toThrow();
        });

        it("should not allow other numbers", () => {
            testVar.value = -1;
            expect(() => {
                S7Variable.check(testVar);
            }).toThrow();
            testVar.value = 3;
            expect(() => {
                S7Variable.check(testVar);
            }).toThrow();
            testVar.value = 256;
            expect(() => {
                S7Variable.check(testVar);
            }).toThrow();
            testVar.value = [1, 2, 3];
            expect(() => {
                S7Variable.check(testVar);
            }).toThrow();
        });
    });

    describe("ARRAY_OF_BIT value tests", () => {
        beforeEach(() => {
            testVar.type = "BIT";
            testVar.bitIndex = 0;
            testVar.count = 3;
        });

        it("should allow valid array with 0, 1 and 2", () => {
            testVar.value = [0, 1, 2];
            expect(() => {
                S7Variable.check(testVar);
            }).not.toThrow();
        });

        it("should not allow other values", () => {
            testVar.value = [-1, 0, 1];
            expect(() => {
                S7Variable.check(testVar);
            }).toThrow();
            testVar.value = [0, 1, 3];
            expect(() => {
                S7Variable.check(testVar);
            }).toThrow();
            testVar.value = 1;
            expect(() => {
                S7Variable.check(testVar);
            }).toThrow();
            testVar.value = "no number";
            expect(() => {
                S7Variable.check(testVar);
            }).toThrow();
        });
    });

    describe("Other value tests", () => {
        it("should allow valid values", () => {
            testVar.type = "FLOAT";
            testVar.value = 3.7;
            expect(() => {
                S7Variable.check(testVar);
            }).not.toThrow();
            testVar.type = "INT16";
            testVar.count = 4;
            testVar.value = [-1, 0, 1, 2];
            expect(() => {
                S7Variable.check(testVar);
            }).not.toThrow();
        });

        it("should not allow value not compatible to type", () => {
            testVar.type = "UINT32";
            testVar.value = -1;
            expect(() => {
                S7Variable.check(testVar);
            }).toThrow();
        });
    });
});
