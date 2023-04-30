// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { SunTraceInfo } from "../types/SunTraceInfo";
import { getPosition, GetSunPositionResult } from "suncalc";

export function getIntensity(sunTraceInfo: SunTraceInfo): number {
    const pos = getPosition(
        new Date(),
        sunTraceInfo.coordinates.latitude,
        sunTraceInfo.coordinates.longitude,
    );
}
