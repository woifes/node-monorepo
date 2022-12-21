// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtNumberType } from "@woifes/binarytypes";
import * as rt from "runtypes";

export const DataTypeNames = rtNumberType.Or(rt.Union(rt.Literal("BIT")));

export type tDataTypeNames = rt.Static<typeof DataTypeNames>;
