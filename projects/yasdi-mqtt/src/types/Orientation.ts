// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";

export const rtOrientation = rt.Record({
    tiltDegrees: rt.Number,
    directionDegrees: rt.Number,
});

export type Orientation = rt.Static<typeof rtOrientation>;
