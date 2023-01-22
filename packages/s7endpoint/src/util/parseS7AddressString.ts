// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { tNumber } from "@woifes/binarytypes";
import { LOGO_ADDRESSES, tS7ShortTypeNames } from "../../src/const";
import { tS7AddressString } from "../../src/types/S7AddressString";
import {
    S7DataAreas,
    S7ShortTypeNames,
    S7TypeNames,
    S7_SHORT_TYPE_TO_TYPE_NAME,
    S7_TYPE_TO_TYPE_NAME,
    tS7DataAreas,
    TYPE_NAME_TO_S7_TYPE,
} from "../const";
import { tDataTypeNames } from "../types/DataTypeNames";
import { S7Address, tS7Address } from "../types/S7Address";

const ADDRESSREGEX =
    /^(?:DB([0-9]+),)?([a-zA-Z]+)([0-9]+)(?:\.([0-9]+))?(?:\.([0-9]+))?$/; //no "_" ensures that no array types can be matched

const LOGO_PREFIX = "LOGO:";

/**
 * Parses an String in the form e. g. M1.2 or DB9,X1.2.3 and creates a S7Address object out of it. Throws on error
 * @param addressString the address string to parse
 * @returns tS7Address object
 */
export function parseS7AddressString(addressString: string): tS7Address {
    //Replace Logo identifier
    if (addressString.startsWith(LOGO_PREFIX)) {
        addressString = replaceLogoConstant(
            addressString.substring(LOGO_PREFIX.length)
        );
    }
    //DB1,X14.0.8
    //Area,Type DBIndex
    const match = addressString.match(ADDRESSREGEX);
    if (match == null || match.length < 3) {
        //only areaType and dbIndex are required
        throw new Error(`Could not parse address string: ${addressString}`);
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

/**
 * Creates a s7AddressString from a given S7Address object
 * @param address the object to stringify
 * @returns addressString of the given S7Address object
 */
export function stringifyS7Address(address: tS7Address): tS7AddressString {
    S7Address.check(address);
    let str = "";
    if (address.area === "DB") {
        str += `DB${address.dbNr},`;
    } else {
        str += address.area;
    }

    if (address.type === "BIT" && address.area != "DB") {
        str += `${address.byteIndex}`;
    } else {
        str += `${typeToS7Type(address.type as tNumber)}${address.byteIndex}`;
    }

    if (address.bitIndex != undefined) {
        str += `.${address.bitIndex}`;
    }

    if (address.count != undefined) {
        str += `.${address.count}`;
    }

    return str;
}

function typeToS7Type(type: tNumber): tDataTypeNames | tS7ShortTypeNames {
    for (const key of Object.keys(S7_SHORT_TYPE_TO_TYPE_NAME)) {
        const val = S7_SHORT_TYPE_TO_TYPE_NAME[key as tS7ShortTypeNames];
        if (val === type) {
            return key as tS7ShortTypeNames;
        }
    }

    return TYPE_NAME_TO_S7_TYPE[type] as tDataTypeNames;
}

function replaceLogoConstant(identifier: string): string {
    if (identifier in LOGO_ADDRESSES) {
        return (LOGO_ADDRESSES as any)[identifier] as string;
    } else {
        throw new Error(
            `Could not find identifier ${identifier} in constants of ${LOGO_PREFIX}`
        );
    }
}
