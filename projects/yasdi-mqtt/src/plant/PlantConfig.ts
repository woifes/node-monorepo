// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";
import { rtCoordinates } from "../types/Coordinates";
import { rtInverterConfig } from "../inverter/InverterConfig";
import { rtOrientation } from "../types/Orientation";

export const rtPlantConfig = rt.Record({
    name: rt.String,
    alias: rt.String.optional(),
    inverter: rt.Array(rtInverterConfig),
    coordinates: rtCoordinates.optional(),
    orientation: rtOrientation.optional(),
});

export type PlantConfig = rt.Static<typeof rtPlantConfig>;
