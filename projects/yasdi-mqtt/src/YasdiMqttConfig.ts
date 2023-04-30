// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { ClientConfig } from "@woifes/mqtt-client";
import * as rt from "runtypes";
import { rtPlantConfig } from "./plant/PlantConfig";

export const rtYasdiMqttConfig = rt.Record({
    name: rt.String,
    mqtt: ClientConfig,
    yasdi: rt.Record({
        plants: rt.Array(rtPlantConfig),
        sendIntervalS: rt.Number.optional(), //default - 5s
        mqttPrefix: rt.String.optional(), //default - tags
    }),
});

export type YasdiMqttConfig = rt.Static<typeof rtYasdiMqttConfig>;
