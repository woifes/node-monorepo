// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { AlarmHandlerMqttConfig } from "@woifes/alarmhandlermqtt";
import * as rt from "runtypes";
import { S7AlarmAddress } from "./S7AlarmAddress";
import { S7DiscreteAlarm } from "./S7DiscreteAlarm";

/**
 * @param alarms either an array of alarm addresses defining each alarm individually
 * or the start address of a bit array with the length specified in "numOfAlarms"
 */
export const S7AlarmHandlerConfig = AlarmHandlerMqttConfig.And(
    rt.Record({
        alarms: rt.Array(S7DiscreteAlarm).Or(S7AlarmAddress),
    })
).withConstraint((config) => {
    if (Array.isArray(config.alarms)) {
        return (
            config.numOfAlarms === config.alarms.length ||
            `If alarms are defined individually the number of alarms has to match the numOfAlarms value`
        );
    }

    return true;
});

export type tS7AlarmHandlerConfig = rt.Static<typeof S7AlarmHandlerConfig>;
