// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";
import { S7Variable } from "../types/S7Variable";

export const DbDefinition = rt.Record({
    vars: rt.String.Or(rt.Array(S7Variable)),
});

export type tDbDefinition = rt.Static<typeof DbDefinition>;
