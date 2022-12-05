// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { S7DataAreas } from "../const";
import { DataTypeNames } from "./DataTypeNames";

import * as rt from "runtypes";

export const S7Address = rt
    .Record({
        dbNr: rt.Number.withConstraint((n) => {
            return n >= 0 || "dbNr may not be negative";
        }).optional(),
        area: S7DataAreas,
        type: DataTypeNames,
        byteIndex: rt.Number.withConstraint((n) => {
            return n >= 0 || "dbIndex may not be negative";
        }),
        bitIndex: rt.Number.withConstraint((n) => {
            return (n >= 0 && n <= 7) || "bitIndex may not be negative";
        }).optional(),
        count: rt.Number.withConstraint((n) => {
            return n >= 0 || "count may not be negative";
        }).optional(),
    })
    .withConstraint((r) => {
        if (r.type == "BIT") {
            if (r.bitIndex == undefined) {
                return `Missing bitIndex on bit type: ${r.type}`;
            }
        }

        if (r.area == "DB") {
            if (r.dbNr == undefined) {
                return "Missing dbNr for DB area address";
            }
        }

        return true;
    });

export type tS7Address = rt.Static<typeof S7Address>;
