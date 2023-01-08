// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { AlarmHandlerConfig } from "@woifes/alarmhandler";
import * as rt from "runtypes";

export const AlarmHandlerMqttConfig = AlarmHandlerConfig.And(
    rt.Record({
        additionalNewAlarmTopics: rt
            .Array(rt.String.withConstraint((s) => s.length > 0))
            .withConstraint((a) => a.length > 0)
            .optional(),
        presentAlarmWatchdogS: rt.Number.withConstraint(
            (n) => n > 0
        ).optional(),
        textCommand: rt
            .Record({
                commandTopicPrefix: rt.String,
                commandResponseTopicPrefix: rt.String,
            })
            .optional(),
    })
);

export type tAlarmHandlerMqttConfig = rt.Static<typeof AlarmHandlerMqttConfig>;
