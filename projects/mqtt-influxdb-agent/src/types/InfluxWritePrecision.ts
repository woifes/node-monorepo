// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";

export const InfluxWritePrecision = rt.Union(
    rt.Literal("ns"),
    rt.Literal("us"),
    rt.Literal("ms"),
    rt.Literal("s")
);

export type tInfluxWritePrecision = rt.Static<typeof InfluxWritePrecision>;
