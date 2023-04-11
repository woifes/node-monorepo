// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";
import { AlarmJsonObject } from "../Alarm/AlarmJsonObject";

export const PresentAlarmsInfo = rt.Record({
    time: rt.String.withConstraint((s) => Number.isFinite(Date.parse(s))),
    alarms: rt.Dictionary(
        AlarmJsonObject,
        rt.Number.withConstraint((n) => n > 0),
    ),
});

/**
 * @param time the time when the object was constructed (for watchdogs)
 * @param alarms array with the json representation of the currently active alarms
 */
export type tPresentAlarmsInfo = rt.Static<typeof PresentAlarmsInfo>;
