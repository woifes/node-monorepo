// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import {
    parseS7AddressString,
    stringifyS7Address,
} from "../../src/util/parseS7AddressString";

const samples: { [key: string]: any } = {
    "M1.2": {
        area: "M",
        type: "BIT",
        byteIndex: 1,
        bitIndex: 2,
    },
    MR1: {
        area: "M",
        type: "FLOAT",
        byteIndex: 1,
    },
    MSInt1: {
        area: "M",
        type: "INT8",
        byteIndex: 1,
    },
    "DB9,X1.2.3": {
        area: "DB",
        dbNr: 9,
        type: "BIT",
        byteIndex: 1,
        bitIndex: 2,
        count: 3,
    },
};

it("should parse correct string", () => {
    for (const str of Object.keys(samples)) {
        expect(parseS7AddressString(str)).toEqual(samples[str]);
    }
});

it("should throw if byte variable has bit index", () => {
    expect(() => {
        parseS7AddressString("DB1,UDInt1.2.3");
    }).toThrow();
});

it("should throw if bit variable missing bit index", () => {
    expect(() => {
        parseS7AddressString("DB1,Bool1");
    }).toThrow();
});

it("should throw if not parseable", () => {
    expect(() => {
        parseS7AddressString("not parseable");
    }).toThrow();
});

it("should generate correct address string", () => {
    for (const str of Object.keys(samples)) {
        expect(stringifyS7Address(samples[str])).toEqual(str);
    }
});

it("should throw on wrong address object", () => {
    expect(() => {
        stringifyS7Address({
            dbNr: 9,
            type: "BIT",
            byteIndex: 1,
            bitIndex: 2,
            count: 3,
        } as any);
    }).toThrow();
});
