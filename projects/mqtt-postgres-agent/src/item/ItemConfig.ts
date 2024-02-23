// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { checkItemUniqueness } from "@woifes/util";
import * as rt from "runtypes";

export const rtItemConfig = rt
    .Record({
        topic: rt.String,
        table: rt.String.withConstraint((s) => s.length > 0),
        topicValues: rt.String.withConstraint((s) => s.length > 0).optional(), // "_/<columnname>/_/<columnname>"
        constValues: rt
            .Dictionary(rt.String.Or(rt.Array(rt.String)), rt.String)
            .withConstraint((dict) => {
                return (
                    Object.keys(dict).length > 0 ||
                    "Value dictionary has to contain at least one value when given"
                );
            })
            .optional(), //columnname: value
        payloadValues: rt
            .Dictionary(rt.String.Or(rt.Array(rt.String)), rt.String)
            .withConstraint((dict) => {
                return (
                    Object.keys(dict).length > 0 ||
                    "Value dictionary has to contain at least one value when given"
                );
            })
            .optional(), //columname: gjson search path
        timestampValues: rt
            .Array(
                rt.String.withConstraint((s) => {
                    return (
                        s.length > 0 ||
                        "Key of timestamp value may not be empty string"
                    );
                }),
            )
            .withConstraint((a) => {
                return (
                    a.length > 0 ||
                    "timestampValues may not be empty string, when given"
                );
            })
            .optional(),
        qos: rt.Number.withConstraint((n) => n >= 0 && n <= 2).optional(),
        messageThrottleMS: rt.Number.withConstraint((n) => n >= 0).optional(),
        minValueTimeDiffMS: rt.Number.withConstraint((n) => n >= 0).optional(),
    })
    .withConstraint((c) => {
        let values: string[] = [];
        if (c.topicValues !== undefined) {
            const topicValues = c.topicValues.split("/").filter((item) => {
                return item.length > 0 && item !== "_";
            });
            values = topicValues;
        }
        if (c.constValues !== undefined) {
            const constValues = Object.keys(c.constValues);
            values = [...values, ...constValues];
        }
        if (c.payloadValues !== undefined) {
            const payloadValues = Object.keys(c.payloadValues);
            values = [...values, ...payloadValues];
        }
        if (c.timestampValues !== undefined) {
            values = [...values, ...c.timestampValues];
        }
        if (!checkItemUniqueness(values)) {
            return `Values are not unique: [${values}]`;
        }

        const payloadArrayLengths = Object.entries(c.payloadValues ?? {})
            .filter(([key, value]) => {
                return Array.isArray(value);
            })
            .map(([key, value]) => {
                return value.length;
            });

        if (payloadArrayLengths.length > 0) {
            const constantArrayLengths = Object.entries(c.constValues ?? {})
                .filter(([key, value]) => {
                    return Array.isArray(value);
                })
                .map(([key, value]) => {
                    return value.length;
                });

            if (payloadArrayLengths[0] !== constantArrayLengths[0]) {
                return "The constant array value and the payload array value have to be equal";
            }

            if (
                !payloadArrayLengths.every((n) => {
                    return n === payloadArrayLengths[0];
                }) ||
                !constantArrayLengths.every((n) => {
                    return n === constantArrayLengths[0];
                })
            ) {
                return "Every constant array type or payload array type hast o be of the same size";
            }

            if (payloadArrayLengths[0] === 0) {
                return "The arrays for serial values may not be empty";
            }
        }

        return true;
    });

export type ItemConfig = rt.Static<typeof rtItemConfig>;
