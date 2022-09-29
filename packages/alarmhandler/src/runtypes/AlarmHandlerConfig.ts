// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import * as rt from "runtypes";

export const AlarmHandlerConfig = rt.Record({
    numOfAlarms: rt.Number.withConstraint((n) => n > 0),
    traceFilePath: rt.String.withConstraint((s) => s.length > 0),
    presentAlarmsFilePath: rt.String.withConstraint((s) => s.length > 0),
    alarmDefsPath: rt.String.withConstraint((s) => s.length > 0).optional(),
});

/**
 * @param numOfAlarms number of alarms which should be used
 * @param traceFilePath file path to store the alarm trace file
 * @param presentAlarmsFilePath file path to store the persistant alarm object
 * @param alarmDefsPath optional the file path to store the alarm definitons
 * If not set a PersitantRuntypeObject with a type compatible to the alarm defs info has to be given.
 * (This can be used to include the alarm persistence into an already existing persistant runtype)
 */
export type tAlarmHandlerConfig = rt.Static<typeof AlarmHandlerConfig>;
