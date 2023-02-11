// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
    parseS7AddressString,
    S7AddressString,
    S7Variable,
} from "@woifes/s7endpoint";
import * as rt from "runtypes";

export const MqttInputTarget = S7AddressString.Or(
    rt
        .Record({
            address: S7AddressString,
            fallbackValue: rt.Unknown,
        })
        .withConstraint((it) => {
            const variable = {
                ...parseS7AddressString(it.address),
                value: it.fallbackValue,
            };
            return (
                S7Variable.validate(variable).success ||
                `MqttInputTarget with address ${it.address} does not match to its fallback value ${it.fallbackValue}`
            );
        })
);

export type tMqttInputTarget = rt.Static<typeof MqttInputTarget>;

export const MqttInputConfig = rt
    .Record({
        topic: rt.String.withConstraint(
            (s) => s.length > 0 || "topic length may not be empty string"
        ),
        target: MqttInputTarget.Or(rt.Array(MqttInputTarget)),
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
                    if (rt.String.guard(tag)) {
                        return `Target needs a value property, when fallback is set`;
                    }
                }
            } else {
                if (rt.String.guard(config.target)) {
                    return `Target needs a value property, when fallback is set`;
                }
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
