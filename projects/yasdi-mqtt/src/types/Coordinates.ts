// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";

export const rtCoordinates = rt.Record({
    latitude: rt.Number,
    longitude: rt.Number,
});

export type Coordinates = rt.Static<typeof rtCoordinates>;
