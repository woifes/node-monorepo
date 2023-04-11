// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";
import { parseS7AddressString } from "../util/parseS7AddressString";
import { S7Address } from "./S7Address";

export const S7AddressString = rt.String.withConstraint((s) => {
    try {
        const result = parseS7AddressString(s);
        return (
            S7Address.validate(result).success === true ||
            "Could not validate result of parsed string"
        );
    } catch (e) {
        return `Could not parse S7AddressString: ${s}`;
    }
});

export type tS7AddressString = rt.Static<typeof S7AddressString>;
