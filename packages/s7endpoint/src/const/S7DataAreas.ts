// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";

export const S7DataAreas = rt.Union(
    rt.Literal("DB"),
    rt.Literal("M"),
    rt.Literal("I"),
    rt.Literal("E"),
    rt.Literal("Q")
);

export type tS7DataAreas = rt.Static<typeof S7DataAreas>;
