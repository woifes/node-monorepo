// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { dbSourceToS7Variables } from "../../src/parseDbSourceFile";
import {
    ALL_TYPES,
    BIT_VARS_IN_A_ROW,
    DEEP_STRUCT,
    DEEP_STRUCT_TAGS,
    EVEN_ADDRESS_2BYTE,
    EVEN_ADDRESS_ARRAY,
    EVEN_ADDRESS_STRUCT,
    EVEN_ADDRESS_STRUCT_ARRAY,
} from "./TestDBs";

it("should generate variables with only elementary types", () => {
    expect(dbSourceToS7Variables(ALL_TYPES.source)).toEqual(
        ALL_TYPES.variables,
    );
});

it("should generate variables for bit variables in a row", () => {
    expect(dbSourceToS7Variables(BIT_VARS_IN_A_ROW.source)).toEqual(
        BIT_VARS_IN_A_ROW.variables,
    );
});

it("should generate variables for deep struct", () => {
    expect(dbSourceToS7Variables(DEEP_STRUCT.source)).toEqual(
        DEEP_STRUCT.variables,
    );
});

it("should generate variables for array types", () => {
    expect(dbSourceToS7Variables(EVEN_ADDRESS_ARRAY.source)).toEqual(
        EVEN_ADDRESS_ARRAY.variables,
    );
});

it("should generate variables for variables with two or more bytes", () => {
    expect(dbSourceToS7Variables(EVEN_ADDRESS_2BYTE.source)).toEqual(
        EVEN_ADDRESS_2BYTE.variables,
    );
});

it("should generate variables struct", () => {
    expect(dbSourceToS7Variables(EVEN_ADDRESS_STRUCT.source)).toEqual(
        EVEN_ADDRESS_STRUCT.variables,
    );
});

it("should generate variables for struct array", () => {
    expect(dbSourceToS7Variables(EVEN_ADDRESS_STRUCT_ARRAY.source)).toEqual(
        EVEN_ADDRESS_STRUCT_ARRAY.variables,
    );
});

it("should generate tags struct", () => {
    expect(dbSourceToS7Variables(DEEP_STRUCT.source, 1)).toEqual(
        DEEP_STRUCT_TAGS,
    );
});
