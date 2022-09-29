// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import * as rt from "runtypes";
import { AlarmDefinition } from "../Alarm/AlarmDefinition";

export const AlarmDefsInfo = rt.Dictionary(
    AlarmDefinition,
    rt.Number.withConstraint((n) => n > 0)
);

/**
 * Dictionary definiton for storing multiple alarm definiton
 */
export type tAlarmDefsInfo = rt.Static<typeof AlarmDefsInfo>;
