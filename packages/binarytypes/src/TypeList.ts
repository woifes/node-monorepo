// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";
import { DataType } from "./DataType";
import { FloatArrDataType } from "./FloatArrDataType";
import { FloatDataType } from "./FloatDataType";
import { IntArrDataType } from "./IntArrDataType";
import { IntDataType } from "./IntDataType";

export const rtNumberType = rt.Union(
    rt.Literal("INT8"),
    rt.Literal("UINT8"),
    rt.Literal("INT16"),
    rt.Literal("UINT16"),
    rt.Literal("INT32"),
    rt.Literal("UINT32"),
    rt.Literal("INT64"),
    rt.Literal("UINT64"),
    rt.Literal("FLOAT"),
    rt.Literal("DOUBLE")
);

export type tNumber = rt.Static<typeof rtNumberType>;

export const rtArrayNumberType = rt.Union(
    rt.Literal("ARRAY_OF_INT8"),
    rt.Literal("ARRAY_OF_UINT8"),
    rt.Literal("ARRAY_OF_INT16"),
    rt.Literal("ARRAY_OF_UINT16"),
    rt.Literal("ARRAY_OF_INT32"),
    rt.Literal("ARRAY_OF_UINT32"),
    rt.Literal("ARRAY_OF_INT64"),
    rt.Literal("ARRAY_OF_UINT64"),
    rt.Literal("ARRAY_OF_FLOAT"),
    rt.Literal("ARRAY_OF_DOUBLE")
);

export type tNumberArray = rt.Static<typeof rtArrayNumberType>;

export const rtTypeName = rt.Union(rtNumberType, rtArrayNumberType);

export type TypeName = rt.Static<typeof rtTypeName>;

export type tJsVal = number | string | bigint | number[] | string[] | bigint[];
export type tVal = tJsVal | Buffer | Buffer[];

/**
 * Collection of DataType validators.
 * * check(): returns an JavaScript value mostly number and number[]. BigInt and BigInt for INT64
 * * validate(): returns true or false if the given value can be converted to the corresponding type
 * * toBuffer(): generates buffer for the corresponding value
 * * fromBuffer(): returns JavaScript value from Buffer representation of the corresponding value
 * * toString(): converts the given value to a string. INT or UINT64 arrays are converted to an stringified array of string
 * * fromString(): returns JavaScript value from String representation of the corresponding value
 * Be aware that except validate() all functions will throw if something goes wrong
 */
const TypeList: {
    [key in TypeName]: DataType;
} = {
    INT8: Object.freeze(new IntDataType(1, true)),
    UINT8: Object.freeze(new IntDataType(1, false)),
    INT16: Object.freeze(new IntDataType(2, true)),
    UINT16: Object.freeze(new IntDataType(2, false)),
    INT32: Object.freeze(new IntDataType(4, true)),
    UINT32: Object.freeze(new IntDataType(4, false)),
    INT64: Object.freeze(new IntDataType(8, true)),
    UINT64: Object.freeze(new IntDataType(8, false)),
    FLOAT: Object.freeze(new FloatDataType(4)),
    DOUBLE: Object.freeze(new FloatDataType(8)),
    ARRAY_OF_INT8: Object.freeze(new IntArrDataType(1, true)),
    ARRAY_OF_UINT8: Object.freeze(new IntArrDataType(1, false)),
    ARRAY_OF_INT16: Object.freeze(new IntArrDataType(2, true)),
    ARRAY_OF_UINT16: Object.freeze(new IntArrDataType(2, false)),
    ARRAY_OF_INT32: Object.freeze(new IntArrDataType(4, true)),
    ARRAY_OF_UINT32: Object.freeze(new IntArrDataType(4, false)),
    ARRAY_OF_INT64: Object.freeze(new IntArrDataType(8, true)),
    ARRAY_OF_UINT64: Object.freeze(new IntArrDataType(8, false)),
    ARRAY_OF_FLOAT: Object.freeze(new FloatArrDataType(4)),
    ARRAY_OF_DOUBLE: Object.freeze(new FloatArrDataType(8)),
};

Object.freeze(TypeList);

export { TypeList };
