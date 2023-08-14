// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { getPosition } from "suncalc";
import { SunTraceInfo } from "../types/SunTraceInfo";

/**
 * Calculates the theoretical intensity of the sun on the PV modules. Uses the current position of the sun and the cosine function for tilt, direction and airmass.
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

    const airMass = 1 / Math.cos(((90 - altitudeDeg) * Math.PI) / 180);
    let intensityByAirMass =
        (1 - 0.14 * sunTraceInfo.coordinates.heightAboveSeeLevelKM) *
            0.7 ** (airMass ** 0.678) +
        0.14 * sunTraceInfo.coordinates.heightAboveSeeLevelKM;
    if (isNaN(intensityByAirMass)) {
        intensityByAirMass = 0;
    }
    const intensityDiffuse = intensityByAirMass * 0.1;

    const roofNormalVecotr = [
        Math.cos(((90 - sunTraceInfo.orientation.tiltDeg) * Math.PI) / 180) *
            Math.cos((sunTraceInfo.orientation.directionDeg * Math.PI) / 180),
        Math.sin(((90 - sunTraceInfo.orientation.tiltDeg) * Math.PI) / 180),
        Math.cos(((90 - sunTraceInfo.orientation.tiltDeg) * Math.PI) / 180) *
            Math.sin((sunTraceInfo.orientation.directionDeg * Math.PI) / 180),
    ];

    const sunVector = [
        Math.cos((altitudeDeg * Math.PI) / 180) *
            Math.cos((azimuthDeg * Math.PI) / 180),
        Math.sin((altitudeDeg * Math.PI) / 180),
        Math.cos((altitudeDeg * Math.PI) / 180) *
            Math.sin((azimuthDeg * Math.PI) / 180),
    ];

    let cosFact =
        roofNormalVecotr[0] * sunVector[0] +
        roofNormalVecotr[1] * sunVector[1] +
        roofNormalVecotr[2] * sunVector[2];

    if (cosFact < 0) {
        cosFact = 0;
    }

    return intensityDiffuse + cosFact * intensityByAirMass;
}
