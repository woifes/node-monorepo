// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { tS7Address } from "../../types/S7Address";
import { getS7AddrSize } from "../../util/getS7AddrSize";

export function getBoundsOfVarSet(set: tS7Address[]): [number, number] {
    const start = Math.min(...set.map((v) => v.byteIndex));
    const end = Math.max(...set.map((v) => v.byteIndex + getS7AddrSize(v)));
    return [start, end];
}
