// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { S7AddressString } from "@woifes/s7endpoint";
import * as rt from "runtypes";
import { S7AlarmAddress } from "./S7AlarmAddress";

export const S7DiscreteAlarm = S7AlarmAddress.And(
    rt.Record({
        invertSignal: rt.Boolean.optional(),
        parameter: rt
            .Array(S7AddressString)
            .withConstraint((a) => a.length > 0)
            .optional(),
    })
);

export type tS7DiscreteAlarm = rt.Static<typeof S7DiscreteAlarm>;
