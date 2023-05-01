// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { SunTraceInfo } from "../types/SunTraceInfo";
import { getPosition } from "suncalc";

/**
 * Calculates the theoretical intensity of the sun on the PV modules. Uses the current position of the sun and the cosine function for tilt and direction.
 * If the sun is below the horizon or the term for the direction part is returning a negative value, zero is returned.
 * @param sunTraceInfo the relevant info for calculating the intensity
 * @returns the intensity 0: nothing, 1.0: maximum intensity
 */
export function getIntensity(sunTraceInfo: SunTraceInfo): number {
    const pos = getPosition(
        new Date(),
        sunTraceInfo.coordinates.latitude,
        sunTraceInfo.coordinates.longitude,
    );

    const altitudeDeg = (pos.altitude * 180) / Math.PI;
    const azimuthDeg = ((pos.azimuth * 180) / Math.PI + 180) % 360;

    let altitudeComponent = 0;

    if (altitudeDeg > 0) {
        //only if sun is up? Defuse light?
        altitudeComponent = Math.cos(
            ((altitudeDeg + sunTraceInfo.orientation.tiltDeg) * Math.PI) / 180,
        );
    }

    const azimuthComponent = Math.cos(
        ((azimuthDeg - sunTraceInfo.orientation.directionDeg) * Math.PI) / 180,
    );

    if (azimuthComponent >= 0) {
        return altitudeComponent * azimuthComponent;
    }
    return 0;
}
