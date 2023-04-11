// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";
import { InfluxDbDatatype } from "../types/InfluxDatatype";
import { InfluxWritePrecision } from "../types/InfluxWritePrecision";

export const ItemConfig = rt.Record({
    topic: rt.String,
    bucket: rt.String.withConstraint((s) => s.length > 0),
    measurement: rt.String.withConstraint((s) => s.length > 0),
    datatype: InfluxDbDatatype.optional(),
    valueName: rt.String.withConstraint((s) => s.length > 0).optional(),
    precision: InfluxWritePrecision.optional(),
    topicTags: rt.String.withConstraint((s) => s.length > 0).optional(), //"_/tag1/_/tag2"
    qos: rt.Number.withConstraint((n) => n >= 0 && n <= 2).optional(),
    minTimeDiffMS: rt.Number.withConstraint((n) => n >= 0).optional(),
    searchPath: rt
        .Array(
            rt.Number.withConstraint((n) => n >= 0).Or(
                rt.String.withConstraint((s) => s.length > 0),
            ),
        )
        .withConstraint((a) => a.length > 0)
        .optional(),
});

export type tItemConfig = rt.Static<typeof ItemConfig>;
