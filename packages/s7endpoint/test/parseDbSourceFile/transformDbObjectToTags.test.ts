// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { transformDbObjectToS7Vars } from "../../src/parseDbSourceFile";
import {
    ALL_TYPES,
    BIT_VARS_IN_A_ROW,
    DEEP_STRUCT,
    EVEN_ADDRESS_2BYTE,
    EVEN_ADDRESS_ARRAY,
    EVEN_ADDRESS_STRUCT,
    EVEN_ADDRESS_STRUCT_ARRAY,
} from "./TestDBs";

it("should generate tags with only elementary types", () => {
    expect(transformDbObjectToS7Vars(ALL_TYPES.object)).toEqual(
        ALL_TYPES.variables
    );
});

it("should generate tags for bit variables in a row", () => {
    expect(transformDbObjectToS7Vars(BIT_VARS_IN_A_ROW.object)).toEqual(
        BIT_VARS_IN_A_ROW.variables
    );
});

it("should generate tags for deep struct", () => {
    expect(transformDbObjectToS7Vars(DEEP_STRUCT.object)).toEqual(
        DEEP_STRUCT.variables
    );
});

it("should generate tags for array types", () => {
    expect(transformDbObjectToS7Vars(EVEN_ADDRESS_ARRAY.object)).toEqual(
        EVEN_ADDRESS_ARRAY.variables
    );
});

it("should generate tags for variables with two or more bytes", () => {
    expect(transformDbObjectToS7Vars(EVEN_ADDRESS_2BYTE.object)).toEqual(
        EVEN_ADDRESS_2BYTE.variables
    );
});

it("should generate tags struct", () => {
    expect(transformDbObjectToS7Vars(EVEN_ADDRESS_STRUCT.object)).toEqual(
        EVEN_ADDRESS_STRUCT.variables
    );
});

it("should generate tags for struct array", () => {
    expect(transformDbObjectToS7Vars(EVEN_ADDRESS_STRUCT_ARRAY.object)).toEqual(
        EVEN_ADDRESS_STRUCT_ARRAY.variables
    );
});
