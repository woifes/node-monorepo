// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { parseS7AddressString } from "../../src/util/parseS7AddressString";

it("should parse correct string", () => {
    //minimal
    expect(parseS7AddressString("M1.2")).toEqual({
        area: "M",
        type: "BIT",
        byteIndex: 1,
        bitIndex: 2,
    });

    //full
    expect(parseS7AddressString("DB9,X1.2.3")).toEqual({
        area: "DB",
        dbNr: 9,
        type: "BIT",
        byteIndex: 1,
        bitIndex: 2,
        count: 3,
    });
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
