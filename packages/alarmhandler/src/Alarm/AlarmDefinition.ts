// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";

export const AlarmDefinition = rt.Record({
    autoAck: rt.Boolean,
    c: rt.String.withConstraint((s) => s.length > 0),
    cn: rt.Number.withConstraint((n) => n >= 0 && n <= 255),
    text: rt.String.withConstraint((s) => s.length > 0),
});

/**
 * Additional information for an alarm
 * @param autoAck how the alarm should be acknowledged
 * @param c the category the alarm belongs to
 * @param cn the number of the alarm inside the category
 * @param text the alarm text (description)
 */
export type tAlarmDefinition = rt.Static<typeof AlarmDefinition>;
