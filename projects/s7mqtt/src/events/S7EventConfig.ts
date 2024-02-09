// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { S7AddressString, parseS7AddressString } from "@woifes/s7endpoint";
import * as rt from "runtypes";
//TODO error messages
export const S7EventConfig = rt.Record({
    trigger: S7AddressString.withConstraint((ta) => {
        const addressObject = parseS7AddressString(ta);
        if (addressObject.count !== undefined && addressObject.count > 1) {
            return "Array variables are not allowed for trigger";
        }
        if (addressObject.type.indexOf("INT") === -1) {
            return "Only integer trigger are allowed";
        }
        return true;
    }),
    pollIntervalMS: rt.Number.withConstraint((n) => n > 0).optional(),
    params: rt.Array(S7AddressString).optional(),
});

export type tS7EventConfig = rt.Static<typeof S7EventConfig>;
