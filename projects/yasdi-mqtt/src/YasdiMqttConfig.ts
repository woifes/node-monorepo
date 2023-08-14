// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { ClientConfig } from "@woifes/mqtt-client";
import * as rt from "runtypes";
import { rtPlantConfig } from "./plant/PlantConfig";
import { rtSunTraceInfo } from "./types/SunTraceInfo";

export const rtYasdiMqttConfig = rt.Record({
    name: rt.String,
    mqtt: ClientConfig,
    yasdi: rt.Record({
        plants: rt.Array(rtPlantConfig),
        sendIntervalS: rt.Number.withConstraint(
            (n) => n > 0 || "Send interval has to be positive",
        ).optional(), //default - 5s
        mqttPrefix: rt.String.optional(), //default - tags
        suntraceInfo: rtSunTraceInfo.optional(), //will be used to calc the sun intensity
    }),
});

export type YasdiMqttConfig = rt.Static<typeof rtYasdiMqttConfig>;
