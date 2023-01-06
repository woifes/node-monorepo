// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { S7Variable } from "@woifes/s7endpoint";
import * as rt from "runtypes";

export const MqttInputConfig = rt
    .Record({
        topic: rt.String.withConstraint(
            (s) => s.length > 0 || "topic length may not be empty string"
        ),
        target: S7Variable.Or(rt.Array(S7Variable)),
        fallback: rt
            .Record({
                watchdogTimeMS: rt.Number.withConstraint((n) => n > 0),
            })
            .optional(),
        minTargetCount: rt.Number.withConstraint((n) => n > 0).optional(),
    })
    .withConstraint((config) => {
        if (config.fallback != undefined) {
            if (Array.isArray(config.target)) {
                for (const tag of config.target) {
                    if (tag.value == undefined) {
                        return `If a fallback is provided there has to be a value set on target`;
                    }
                }
            } else {
                return (
                    config.target.value != undefined ||
                    `If a fallback is provided there has to be a value set on target`
                );
            }
        }
        if (Array.isArray(config.target)) {
            if (config.minTargetCount != undefined) {
                if (config.minTargetCount > config.target.length) {
                    return "minTargetCount may not be bigger than target count itself";
                }
            }
        }
        return true;
    });

export type tMqttInputConfig = rt.Static<typeof MqttInputConfig>;
