// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";
import { rtSunTraceInfo } from "../types/SunTraceInfo";

export const rtInverterConfig = rt.Record({
    id: rt.String,
    serialNumber: rt.Number,
    pNomW: rt.Number.optional(),
    suntraceInfo: rtSunTraceInfo.optional(), //will be used to calc the sun intensity
});

export type InverterConfig = rt.Static<typeof rtInverterConfig>;
