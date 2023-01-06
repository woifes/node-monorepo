// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as rt from "runtypes";
import { S7OutputConfig } from "./S7OutputConfig";

export const S7OutputMqttConfig = S7OutputConfig.And(
    rt.Record({
        topicPrefix: rt.String.withConstraint((s) => s.length > 0).optional(),
        qos: rt.Union(rt.Literal(0), rt.Literal(1), rt.Literal(2)).optional(),
        retain: rt.Boolean.optional(),
    })
);

export type tS7OutputMqttConfig = rt.Static<typeof S7OutputMqttConfig>;
