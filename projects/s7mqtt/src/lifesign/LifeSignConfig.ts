// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { S7AddressString, parseS7AddressString } from "@woifes/s7endpoint";
import * as rt from "runtypes";

export const rtLifeSignConfig = rt
    .Record({
        out: rt
            .Record({
                address: S7AddressString,
                pollIntervalMS: rt.Number.withConstraint((n) => n > 0),
                timeoutMS: rt.Number.withConstraint((n) => n > 0),
                topic: rt.String.optional(),
            })
            .withConstraint((o) => {
                const s7Address = parseS7AddressString(o.address);
                if (s7Address.type === "FLOAT" || s7Address.type === "DOUBLE") {
                    return "Can not use floating point value for life sign out";
                }
                return true;
            })
            .optional(),
        in: rt
            .Record({
                address: S7AddressString,
                cycleMS: rt.Number.withConstraint((n) => n > 0),
            })
            .withConstraint((o) => {
                const s7Address = parseS7AddressString(o.address);
                if (s7Address.type !== "BIT" && s7Address.type !== "UINT16") {
                    return "In life sign has to be BIT or UINT16";
                }
                return true;
            })
            .optional(),
    })
    .withConstraint((lf) => {
        if (lf.out === undefined && lf.in === undefined) {
            return "A life sign with neither in nor out is useless";
        }
        return true;
    });

export type LifeSignConfig = rt.Static<typeof rtLifeSignConfig>;
