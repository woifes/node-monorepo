// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { DBFileDescriptor, S7AddressString } from "@woifes/s7endpoint";
import * as rt from "runtypes";

export const S7OutputConfig = rt.Record({
    tags: rt
        //TODO key more constraints?
        .Dictionary(S7AddressString, rt.String)
        .withConstraint((dict) => {
            return (
                Object.keys(dict).length > 0 ||
                `list of address strings may not be empty`
            );
        })
        .optional(),
    datablocks: rt
        .Array(DBFileDescriptor)
        .withConstraint((a) => {
            return a.length > 0 || `Array of datablocks may no be empty`;
        })
        .optional(),
    pollIntervalMS: rt.Number.withConstraint((n) => n > 0).optional(),
});

export type tS7OutputConfig = rt.Static<typeof S7OutputConfig>;
