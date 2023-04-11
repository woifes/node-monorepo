// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";

export const S7TypeNames = rt.Union(
    rt.Literal("Bool"),
    rt.Literal("Byte"),
    rt.Literal("Word"),
    rt.Literal("SInt"),
    rt.Literal("USInt"),
    rt.Literal("Int"),
    rt.Literal("UInt"),
    rt.Literal("DInt"),
    rt.Literal("UDInt"),
    rt.Literal("Time"),
    rt.Literal("Real"),
);

export type tS7TypeNames = rt.Static<typeof S7TypeNames>;

export const S7ShortTypeNames = rt.Union(
    rt.Literal("X"),
    rt.Literal("B"),
    rt.Literal("W"),
    rt.Literal("DW"),
    rt.Literal("D"),
    rt.Literal("I"),
    rt.Literal("DI"),
    rt.Literal("R"),
);

export type tS7ShortTypeNames = rt.Static<typeof S7ShortTypeNames>;
