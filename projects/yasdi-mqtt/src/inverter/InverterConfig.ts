// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtCoordinates } from "../types/Coordinates";
import { rtOrientation } from "../types/Orientation";
import * as rt from "runtypes";

export const rtInverterConfig = rt.Record({
    id: rt.String,
    serialNumber: rt.Number,
    pNomW: rt.Number.optional(),
    coordinates: rtCoordinates.optional(),
    orientation: rtOrientation.optional(),
});

export type InverterConfig = rt.Static<typeof rtInverterConfig>;
