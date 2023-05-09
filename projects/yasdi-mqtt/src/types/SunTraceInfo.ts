// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtCoordinates } from "./Coordinates";
import { rtOrientation } from "./Orientation";
import * as rt from "runtypes";

export const rtSunTraceInfo = rt.Record({
    coordinates: rtCoordinates,
    orientation: rtOrientation,
});

export type SunTraceInfo = rt.Static<typeof rtSunTraceInfo>;
