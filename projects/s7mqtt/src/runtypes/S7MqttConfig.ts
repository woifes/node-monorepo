// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ClientConfig } from "@woifes/mqtt-client";
import {
    S7LocalEndpointConfig,
    S7RemoteEndpointConfig,
} from "@woifes/s7endpoint";
import * as rt from "runtypes";
import { S7AlarmHandlerConfig } from "../alarms/S7AlarmHandlerConfig";
import { S7CommandConfig } from "../commands/S7CommandConfig";
import { S7EventMqttConfig } from "../events/S7EventMqttConfig";
import { MqttInputConfig } from "../inputs/MqttInputConfig";
import { rtLifeSignConfig } from "../lifesign/LifeSignConfig";
import { S7OutputMqttConfig } from "../outputs/S7OutputMqttConfig";

export const S7MqttConfig = rt.Record({
    mqtt: ClientConfig,
    endpoint: S7RemoteEndpointConfig.Or(
        S7LocalEndpointConfig.omit("datablocks"),
    ),
    alarms: S7AlarmHandlerConfig.optional(),
    lifesign: rtLifeSignConfig.optional(),
    inputs: rt
        .Array(MqttInputConfig)
        .withConstraint((a) => a.length > 0 || "Inputs array must not be zero")
        .optional(),
    outputs: rt
        .Array(S7OutputMqttConfig)
        .withConstraint((a) => a.length > 0 || "Inputs array must not be zero")
        .optional(),
    events: rt
        .Array(S7EventMqttConfig)
        .withConstraint((a) => a.length > 0 || "Events array must not be zero")
        .optional(),
    commands: rt
        .Array(S7CommandConfig)
        .withConstraint(
            (a) => a.length > 0 || "Commands array must not be zero",
        )
        .optional(),
});

export type tS7MqttConfig = rt.Static<typeof S7MqttConfig>;
