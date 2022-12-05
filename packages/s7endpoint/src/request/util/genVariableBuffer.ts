// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { DataTypes, tJsVal } from "@woifes/binarytypes";
import { tS7Variable } from "../../types/S7Variable";
import { getS7AddrSize } from "../../util/getS7AddrSize";
import { setBitInBuffer } from "./setBitInBuffer";

export function genVariableBuffer(variable: tS7Variable): Buffer {
    let variableBuf: Buffer;

    if (variable.type == "BIT") {
        if (variable.count == undefined) {
            //single bit
            variableBuf = Buffer.alloc(getS7AddrSize(variable));
            const bitValue = variable.value! == 0 ? false : true;
            setBitInBuffer(bitValue, variableBuf, variable.bitIndex!);
        } else {
            //array of bit
            variableBuf = Buffer.alloc(getS7AddrSize(variable));
            const arrayValue = variable.value as number[];
            for (
                let i = variable.bitIndex!;
                i < variable.bitIndex! + variable.count!;
                i++
            ) {
                const bitValue =
                    arrayValue[i - variable.bitIndex!] == 0 ? false : true;
                setBitInBuffer(bitValue, variableBuf, i);
            }
        }
    } else {
        if (variable.count == undefined) {
            variableBuf = DataTypes[variable.type].toBuffer(
                variable.value as tJsVal,
                false
            );
        } else {
            variableBuf = DataTypes[`ARRAY_OF_${variable.type}`].toBuffer(
                variable.value as tJsVal,
                false
            );
        }
    }

    return variableBuf;
}
