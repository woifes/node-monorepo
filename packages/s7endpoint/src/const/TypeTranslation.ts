// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { tNumber } from "@woifes/binarytypes";
import { tDataTypeNames } from "../types/DataTypeNames";
import { tS7ShortTypeNames, tS7TypeNames } from "./S7TypeNames";

export const S7_TYPE_TO_TYPE_NAME: { [key in tS7TypeNames]: tDataTypeNames } = {
    Bool: "BIT",
    Byte: "UINT8",
    Word: "UINT16",
    SInt: "INT8",
    USInt: "UINT8",
    Int: "INT16",
    UInt: "UINT16",
    DInt: "INT32",
    UDInt: "UINT32",
    Time: "UINT32",
    Real: "FLOAT",
};

export const TYPE_NAME_TO_S7_TYPE: { [key in tNumber | "BIT"]: string } = {
    BIT: "Bool",
    INT8: "SInt",
    UINT8: "USInt",
    INT16: "Int",
    UINT16: "UInt",
    INT32: "DInt",
    UINT32: "UDInt",
    INT64: "LInt",
    UINT64: "ULInt",
    FLOAT: "Real",
    DOUBLE: "LReal",
};

export const S7_SHORT_TYPE_TO_TYPE_NAME: {
    [key in tS7ShortTypeNames]: tDataTypeNames;
} = {
    X: "BIT",
    B: "UINT8",
    W: "UINT16",
    DW: "UINT32",
    D: "UINT32",
    I: "INT16",
    DI: "INT32",
    R: "FLOAT",
};
