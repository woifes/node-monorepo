// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { DataTypes, tNumber } from "@woifes/binarytypes";
import { CsvFileHandler } from "@woifes/util";
import { TYPE_NAME_TO_S7_TYPE } from "../const";
import { tS7Variable } from "../types/S7Variable";

function getTypeField(variable: tS7Variable): string {
    let type: string;
    if (variable.type.indexOf("ARRAY") != -1) {
        const rawType = variable.type.split("_OF_")[1] as tNumber | "BIT";
        type = `Array[0..${variable.count! - 1}] of ${
            TYPE_NAME_TO_S7_TYPE[rawType]
        }`;
    } else {
        type = TYPE_NAME_TO_S7_TYPE[variable.type as tNumber | "BIT"];
    }
    return type;
}

function getSizeField(variable: tS7Variable): number {
    if (variable.type == "BIT") {
        return 1;
    } else {
        return DataTypes[variable.type].size;
    }
}

function getAddressField(dbNr: number, variable: tS7Variable): string {
    let address = `%DB${dbNr}.`;
    if (variable.type == "BIT") {
        address += `DBX${variable.byteIndex}.${variable.bitIndex}`;
    } else if (DataTypes[variable.type].size == 4) {
        address += `DBD${variable.byteIndex}`;
    } else if (DataTypes[variable.type].size == 2) {
        address += `DBW${variable.byteIndex}`;
    } else {
        address += `DBB${variable.byteIndex}`;
    }
    return address;
}

export function writeDbCsv(
    writer: CsvFileHandler,
    dbNr: number,
    vars: tS7Variable[],
    allowArrayTypes = false
) {
    for (const variable of vars) {
        const size = getSizeField(variable);
        const address = getAddressField(dbNr, variable);
        const type = getTypeField(variable);
        if (type.indexOf("Array") != -1 && !allowArrayTypes) {
            throw new Error("Try to write forbidden array variable");
        }

        writer.writeLine(
            [
                `${variable.name as string}`,
                `Standard-Variablentabelle`,
                `Con01`,
                `<No Value>`,
                `${type}`,
                `${size}`,
                `Binary`,
                `Absolute access`,
                `${address}`,
                `False`,
                `<No Value>`,
                `<No Value>`,
                `0`,
                `Cyclic in operation`,
                `1 s`,
                `None`,
                `<No Value>`,
                `None`,
                `<No Value>`,
                `False`,
                `10`,
                `0`,
                `100`,
                `0`,
            ].join(";")
        );
    }
}
