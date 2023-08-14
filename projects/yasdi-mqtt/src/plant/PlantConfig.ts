// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { checkItemUniqueness } from "@woifes/util";
import * as rt from "runtypes";
import { rtInverterConfig } from "../inverter/InverterConfig";
import { rtSunTraceInfo } from "../types/SunTraceInfo";

export const rtPlantConfig = rt.Record({
    name: rt.String,
    alias: rt.String.optional(),
    inverter: rt.Array(rtInverterConfig).withConstraint((inverter) => {
        return (
            checkItemUniqueness(inverter, (i) => {
                return i.id;
            }) || "Id is not unique in plant"
        );
    }),
    sunTraceInfo: rtSunTraceInfo.optional(), //will be used to calc the sun intensity
});

export type PlantConfig = rt.Static<typeof rtPlantConfig>;
