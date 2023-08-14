// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";
import { SunTraceInfo } from "../types/SunTraceInfo";
import { getIntensity } from "./getIntensity";

export async function postIntensity(
    sunTraceInfo: SunTraceInfo,
    topic: string,
    mqtt: Client,
) {
    const intensity = getIntensity(sunTraceInfo);
    await mqtt.publishValue(topic, intensity, "FLOAT");
}
