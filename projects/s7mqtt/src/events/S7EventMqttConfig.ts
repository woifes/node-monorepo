// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as rt from "runtypes";
import { S7EventConfig } from "./S7EventConfig";

export const S7EventMqttConfig = S7EventConfig.And(
    rt.Record({
        topic: rt.String.withConstraint((s) => s.length > 0),
        message: rt.String.optional(),
    })
);

export type tS7EventMqttConfig = rt.Static<typeof S7EventMqttConfig>;
