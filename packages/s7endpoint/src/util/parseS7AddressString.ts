// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import {
    S7DataAreas,
    S7ShortTypeNames,
    S7TypeNames,
    S7_SHORT_TYPE_TO_TYPE_NAME,
    S7_TYPE_TO_TYPE_NAME,
    tS7DataAreas,
} from "../const";
import { tDataTypeNames } from "../types/DataTypeNames";
import { tS7Address } from "../types/S7Address";

const ADDRESSREGEX =
    /^(?:DB([0-9]+),)?([a-zA-Z]+)([0-9]+)(?:\.([0-9]+))?(?:\.([0-9]+))?$/; //no "_" ensures that no array types can be matched

export function parseS7AddressString(addressString: string): tS7Address {
    //DB1,X14.0.8
    //Area,Type DBIndex
    const match = addressString.match(ADDRESSREGEX);
    if (match == null || match.length < 3) {
        //only areaType and dbIndex are required
        throw new Error("Could not parse address string");
    }
    const [_, dbNrStr, typeStr, dbIndexStr, quantifier1, quantifier2] = match;

    let dbNr: number | undefined = undefined;
    const byteIndex = parseInt(dbIndexStr);
    let area: tS7DataAreas;
    let type: tDataTypeNames;
    if (dbNrStr != undefined) {
        dbNr = parseInt(dbNrStr); //will always succeed because of the regex
        area = "DB";
        type = checkTypeString(typeStr);
    } else {
        const areaChar = typeStr[0];
        if (S7DataAreas.guard(areaChar)) {
            area = areaChar;
        } else {
            throw new Error(`Could not determine area code: ${addressString}`);
        }

        if (typeStr.substring(1).length == 0) {
            //only merker bit
            type = "BIT";
        } else {
            type = checkTypeString(typeStr.substring(1));
        }
    }

    let bitIndex: number | undefined = undefined;
    let count: number | undefined = undefined;
    if (type == "BIT") {
        bitIndex = parseInt(quantifier1); //quantifier1 must be bitindex
        if (!Number.isFinite(bitIndex)) {
            throw new Error("Missing bitIndex for bit variable");
        }
        if (quantifier2 != undefined) {
            count = parseInt(quantifier2);
        }
    } else {
        if (quantifier2 != undefined) {
            throw new Error("A byte wise variable has two quantifier");
        }
        if (quantifier1 != undefined) {
            count = parseInt(quantifier1);
        }
    }

    return {
        dbNr,
        type,
        area,
        byteIndex,
        bitIndex,
        count,
    };
}

function checkTypeString(typeStr: string): tDataTypeNames {
    if (S7ShortTypeNames.guard(typeStr)) {
        return S7_SHORT_TYPE_TO_TYPE_NAME[typeStr];
    }

    if (S7TypeNames.guard(typeStr)) {
        return S7_TYPE_TO_TYPE_NAME[typeStr];
    }

    throw new Error("unknown type");
}
