// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";

export const AlarmJsonObject = rt.Record({
    category: rt.String.optional(),
    categoryNum: rt.Number.optional(),
    text: rt.String.optional(),
    occurred: rt.String.optional(),
    ackTime: rt.String.optional(),
});

/**
 * A compact representation of the alarm. Should be used for notification or persistence
 */
export type tAlarmJsonObject = rt.Static<typeof AlarmJsonObject>;
