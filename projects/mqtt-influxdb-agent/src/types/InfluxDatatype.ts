// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";

export const InfluxDbDatatype = rt.Union(
    rt.Literal("int"),
    rt.Literal("uint"),
    rt.Literal("float"),
    rt.Literal("boolean"),
);

export type tInfluxDbDatatype = rt.Static<typeof InfluxDbDatatype>;
