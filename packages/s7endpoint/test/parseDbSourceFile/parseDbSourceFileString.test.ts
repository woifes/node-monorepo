// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { parseDBsourceFileString } from "../../src/parseDbSourceFile";
import {
    ALL_TYPES,
    BIT_VARS_IN_A_ROW,
    DEEP_STRUCT,
    EVEN_ADDRESS_2BYTE,
    EVEN_ADDRESS_ARRAY,
    EVEN_ADDRESS_STRUCT,
    EVEN_ADDRESS_STRUCT_ARRAY,
} from "./TestDBs";

it("should parse all elementary types", () => {
    expect(parseDBsourceFileString(ALL_TYPES.source)).toEqual(ALL_TYPES.object);
});

it("should parse bit var in a row", () => {
    expect(parseDBsourceFileString(BIT_VARS_IN_A_ROW.source)).toEqual(
        BIT_VARS_IN_A_ROW.object,
    );
});

it("should parse a deep nested object", () => {
    expect(parseDBsourceFileString(DEEP_STRUCT.source)).toEqual(
        DEEP_STRUCT.object,
    );
});

it("should parse arrays object", () => {
    expect(parseDBsourceFileString(EVEN_ADDRESS_ARRAY.source)).toEqual(
        EVEN_ADDRESS_ARRAY.object,
    );
});

it("should parse 2 byte vars object", () => {
    expect(parseDBsourceFileString(EVEN_ADDRESS_2BYTE.source)).toEqual(
        EVEN_ADDRESS_2BYTE.object,
    );
});

it("should parse struct object", () => {
    expect(parseDBsourceFileString(EVEN_ADDRESS_STRUCT.source)).toEqual(
        EVEN_ADDRESS_STRUCT.object,
    );
});

it("should parse struct array object", () => {
    expect(parseDBsourceFileString(EVEN_ADDRESS_STRUCT_ARRAY.source)).toEqual(
        EVEN_ADDRESS_STRUCT_ARRAY.object,
    );
});
