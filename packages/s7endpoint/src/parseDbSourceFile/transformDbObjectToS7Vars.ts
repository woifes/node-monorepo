// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { S7TypeNames, S7_TYPE_TO_TYPE_NAME } from "../const";
import { tDataTypeNames } from "../types/DataTypeNames";
import { tS7Variable } from "../types/S7Variable";
import { getS7AddrSize } from "../util/getS7AddrSize";
import { DbObject } from "./parseDbSourceFileString";

type ParseLineResult = {
    type: tDataTypeNames;
    count?: number;
    comment?: string;
};

/**
 * Parses the given line of a data block source file
 * @param str the string to parse
 * @returns object with type, count (for arrays) and comment
 */
function parseDbLine(str: string): ParseLineResult {
    let type = str.split(";")[0];
    const comment = str.split("//")[1];
    if (type == undefined) {
        throw new Error(
            `Error in parseLineToTagDesc, type is undefinded. str:${str}`
        );
    }

    let count: number | undefined = undefined;

    if (type.indexOf("Array") != -1) {
        //is array type
        const lowerBound = parseInt(type.split("[")[1].split("..")[0]);
        const upperBound = parseInt(type.split("]")[0].split("..")[1]);
        type = type.split("of")[1];
        if (!isNaN(lowerBound) && !isNaN(upperBound)) {
            count = 1 + (upperBound - lowerBound);
        } else {
            throw new Error(`Could not calculate Array size`);
        }
    }

    if (!S7TypeNames.guard(type)) {
        throw new Error(`Type ${type} is no valid S7 type name`);
    }

    const variable: ParseLineResult = {
        type: S7_TYPE_TO_TYPE_NAME[type],
        count,
    };

    if (comment != undefined) {
        variable.comment = comment;
    }
    return variable;
}

/**
 * Transforms the object representation of
 * @param obj
 * @param prefix
 * @param byteIndex
 * @returns
 */
export function transformDbObjectToS7Vars(
    obj: DbObject,
    prefix?: string,
    byteIndex = 0
): tS7Variable[] {
    let resultArray: tS7Variable[] = [];
    let bitIndex: number | undefined = undefined;
    //console.log("got obj", obj);
    for (const key in obj) {
        const element = obj[key];
        let variableTmp: tS7Variable;
        let name: string;
        if (prefix != undefined) {
            name = [prefix, key].join("/");
        } else {
            name = key;
        }
        if (typeof element == "object") {
            let newArr: tS7Variable[] = [];
            bitIndex = undefined; //reset bitindex if a struct is comming
            byteIndex += byteIndex % 2; //if a new struct begins it hast to be a even address!
            newArr = transformDbObjectToS7Vars(element, name, byteIndex);
            variableTmp = newArr[newArr.length - 1];

            byteIndex = variableTmp.byteIndex + getS7AddrSize(variableTmp);

            byteIndex += byteIndex % 2; //after a struct it hast o be continued with an even address
            resultArray = resultArray.concat(newArr);
        } else {
            const dbLineInfo = parseDbLine(element);
            variableTmp = {
                area: "DB",
                name: name,
                byteIndex: 0,
                ...dbLineInfo,
            };
            if (variableTmp.type == "BIT" && variableTmp.count == undefined) {
                if (bitIndex == undefined) {
                    bitIndex = 0;
                } else {
                    bitIndex++;
                    if (bitIndex >= 8) {
                        byteIndex++;
                        bitIndex = 0;
                    }
                }
                variableTmp.byteIndex = byteIndex;
                variableTmp.bitIndex = bitIndex;
            } else {
                if (bitIndex != undefined) {
                    //before there came a bit variable
                    byteIndex++;
                    bitIndex = undefined;
                }
                if (
                    variableTmp.count == undefined &&
                    (variableTmp.type == "UINT8" || variableTmp.type == "INT8")
                ) {
                    variableTmp.byteIndex = byteIndex;
                } else {
                    if (
                        variableTmp.type == "BIT" &&
                        variableTmp.count != undefined //is implied because of the condition above anways
                    ) {
                        variableTmp.bitIndex = 0;
                    }
                    byteIndex += byteIndex % 2;
                    variableTmp.byteIndex = byteIndex;
                }
                byteIndex += getS7AddrSize(variableTmp);
                if (variableTmp.count != undefined) {
                    byteIndex += byteIndex % 2;
                }
            }
            resultArray.push(variableTmp);
        }
    }
    return resultArray;
}
