// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { DataTypes } from "@woifes/binarytypes";
import { tS7Address } from "../types/S7Address";

/**
 *
 * @param t the variable description
 * @returns the size in bytes
 */
export function getS7AddrSize(t: tS7Address): number {
    if (t.type == "BIT") {
        if (t.count == undefined) {
            return 1;
        } else {
            return Math.ceil((t.bitIndex! + t.count!) / 8);
        }
    } else {
        if (t.count == undefined) {
            return DataTypes[t.type].size;
        } else {
            return DataTypes[t.type].size * t.count!;
        }
    }
}
