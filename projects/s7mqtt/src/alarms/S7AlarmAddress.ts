// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as rt from "runtypes";
import { S7SingleBitAddressString } from "../types/S7SingleBitAddressString";

/**
 * @param signal the signal from the plc
 * @param ackOut the ack signal from the plc
 * @param ackIn the ack signal to the plc
 */
export const S7AlarmAddress = rt.Record({
    signal: S7SingleBitAddressString,
    ackOut: S7SingleBitAddressString.optional(),
    ackIn: S7SingleBitAddressString.optional(),
});

export type tS7AlarmAddress = rt.Static<typeof S7AlarmAddress>;
