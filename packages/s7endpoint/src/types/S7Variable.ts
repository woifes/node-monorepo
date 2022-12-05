// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { DataTypes } from "@woifes/binarytypes";
import * as rt from "runtypes";
import { S7Address } from "./S7Address";

/**
 * This runtype basically only checks if a provided value (if present) is compatible to the given type(-array)
 */
export const S7Variable = S7Address.And(
    rt.Record({
        name: rt.String.optional(),
        value: rt.Unknown.optional(),
        comment: rt.String.optional(),
    })
).withConstraint((r) => {
    if (r.value != undefined) {
        if (r.type == "BIT") {
            if (r.count == undefined) {
                //single bit
                if (!DataTypes["UINT8"].validate(r.value as any)) {
                    return `value(${r.value}) provided for tag is not compatible with type: ${r.type}`;
                }
                const value = DataTypes["UINT8"].check(r.value as any);
                if ((value as number) < 0 || (value as number) > 2) {
                    return `value(${r.value}) does not match the bit operation values`;
                }
            } else {
                //bit array
                if (!DataTypes["ARRAY_OF_UINT8"].validate(r.value as any)) {
                    return `value(${r.value}) provided for tag is not compatible with type: ${r.type}`;
                }
                const values = DataTypes["ARRAY_OF_UINT8"].check(
                    r.value as any
                ) as number[];
                for (const value of values) {
                    if ((value as number) < 0 || (value as number) > 2) {
                        return `value(${r.value}) does not match the bit operation values`;
                    }
                }
            }
        } else {
            if (r.count == undefined) {
                //single value
                if (!DataTypes[r.type].validate(r.value as any)) {
                    return `value(${r.value}) provided for tag is not compatible with type: ${r.type}`;
                }
            } else {
                //array value
                if (!DataTypes[`ARRAY_OF_${r.type}`].validate(r.value as any)) {
                    return `value(${r.value}) provided for tag is not compatible with type: ${r.type}`;
                }
                const values = DataTypes[`ARRAY_OF_${r.type}`].check(
                    r.value as any
                ) as number[];
                if (values.length != r.count!) {
                    return `value length(${values.length}) in DVariable does not match with count(${r.count})`;
                }
            }
        }
    }
    return true;
});

export type tS7Variable = rt.Static<typeof S7Variable>;
