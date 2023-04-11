// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { parseS7AddressString, S7AddressString } from "@woifes/s7endpoint";
import * as rt from "runtypes";

export const S7SingleBitAddressString = S7AddressString.withConstraint((s) => {
    const address = parseS7AddressString(s);
    return (
        (address.type === "BIT" &&
            (address.count === undefined || address.count === 1)) ||
        `Address string ${s} is no single bit address`
    );
}); //S7Address.//.And(rt.Record({ bitIndex: rt.Number }));

export type tS7SingleBitAddressString = rt.Static<
    typeof S7SingleBitAddressString
>;
