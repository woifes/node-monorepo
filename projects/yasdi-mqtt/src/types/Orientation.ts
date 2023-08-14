// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";

export const rtOrientation = rt.Record({
    tiltDeg: rt.Number, //tilt of the pv modules
    directionDeg: rt.Number, //direction the pv modules are facing. 0° = North, 90° = East, 180° = South, 270° = West
});

export type Orientation = rt.Static<typeof rtOrientation>;
