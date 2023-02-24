// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ClientConfig } from "@woifes/mqtt-client";
import * as rt from "runtypes";

export const MatrixMqttBridgeConfig = rt.Record({
    mqtt: ClientConfig,
    matrix: rt.Record({
        url: rt.String,
        userName: rt.String,
        password: rt.String,
    }),
    bridge: rt.Record({
        mqttTopicPrefix: rt.String.withConstraint((s) => {
            if (s.indexOf("#") !== -1 || s.indexOf("+") !== -1) {
                return "Special MQTT characters are not allowed in mqttTopicPrefix";
            }
            return s.length > 0 || "mqttTopicPrefix may no empty string";
        }).optional(),
        matrixMaxMessageAgeS: rt.Number.withConstraint((n) => {
            return n > 0 || `matrixMaxMessageAge as to be greater than 0`;
        }).optional(),
        rooms: rt.Array(
            rt.Record({
                roomId: rt.String.withConstraint((s) => {
                    if (
                        s.indexOf("#") !== -1 ||
                        s.indexOf("+") !== -1 ||
                        s.indexOf("/") !== -1
                    ) {
                        return "Special MQTT characters are not allowed in roomId";
                    }
                    return s.length > 0 || "roomId may no empty string";
                }),
                federate: rt.Boolean.optional(),
                public: rt.Boolean.optional(),
            })
        ),
    }),
});

export type tMatrixMqttBridgeConfig = rt.Static<typeof MatrixMqttBridgeConfig>;
