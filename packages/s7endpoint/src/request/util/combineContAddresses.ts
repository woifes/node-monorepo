// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { tS7Address } from "../../types/S7Address";
import { sortDbAddresses } from "../../util/sortDb";
import { getBoundsOfVarSet } from "./getBoundsOfVarSet";

function checkOverlap(A: tS7Address[], B: tS7Address[]): boolean {
    const [startA, endA] = getBoundsOfVarSet(A);
    const [startB, endB] = getBoundsOfVarSet(B);
    if (startB > endA || startA > endB) {
        return false;
    }
    return true;
}

/**
 * Combines all variables which are in a continuos order
 * @param variables the variables to combine
 * @returns an array of array where each sub array is continuos
 */
export function combineContAddresses(variables: tS7Address[]): tS7Address[][] {
    variables.sort(sortDbAddresses);
    const variableArr: tS7Address[][] = [];
    const result: tS7Address[][] = [];
    for (const variable of variables) {
        variableArr.push([variable]);
    }

    while (variableArr.length > 0) {
        if (variableArr.length === 1) {
            result.push(variableArr[0]);
            break;
        } else {
            let testee: tS7Address[] = variableArr.shift()!;
            while (variableArr.length > 0) {
                if (checkOverlap(testee, variableArr[0])) {
                    const next = variableArr.shift()!;
                    testee = [...testee, ...next];
                } else {
                    break;
                }
            }
            result.push(testee);
        }
    }

    return result;
}
