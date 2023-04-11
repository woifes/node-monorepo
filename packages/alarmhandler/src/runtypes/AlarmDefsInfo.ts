// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";
import { AlarmDefinition } from "../Alarm/AlarmDefinition";

export const AlarmDefsInfo = rt.Dictionary(
    AlarmDefinition,
    rt.Number.withConstraint((n) => n > 0),
);

/**
 * Dictionary definition for storing multiple alarm definition
 */
export type tAlarmDefsInfo = rt.Static<typeof AlarmDefsInfo>;
