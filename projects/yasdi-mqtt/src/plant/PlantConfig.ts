// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtInverterConfig } from "../inverter/InverterConfig";
import { rtCoordinates } from "../types/Coordinates";
import { rtOrientation } from "../types/Orientation";
import { checkItemUniqueness } from "packages/util/dist";
import * as rt from "runtypes";

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
    coordinates: rtCoordinates.optional(),
    orientation: rtOrientation.optional(),
});

export type PlantConfig = rt.Static<typeof rtPlantConfig>;
