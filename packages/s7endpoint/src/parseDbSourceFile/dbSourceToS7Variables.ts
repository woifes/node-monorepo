// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { tS7Variable } from "../types/S7Variable";
import { parseDBsourceFileString } from "./parseDbSourceFileString";
import { transformDbObjectToS7Vars } from "./transformDbObjectToS7Vars";

export function dbSourceToS7Variables(source: string): tS7Variable[];
export function dbSourceToS7Variables(
    source: string,
    dbNr: number
): tS7Variable[];

/**
 * Generates an array of TagDefinitions for a given data block source file string
 * @param source The string to parse
 * @returns array of DbVariables
 */
export function dbSourceToS7Variables(
    source: string,
    dbNr?: number
): tS7Variable[] {
    const variables: tS7Variable[] = transformDbObjectToS7Vars(
        parseDBsourceFileString(source)
    );
    //TODO dbNr needed?
    if (dbNr != undefined) {
        if (dbNr <= 0) {
            throw new Error("dbNr may not be zero or negative");
        }
        const tags: tS7Variable[] = [];
        for (const v of variables) {
            tags.push({ ...v, dbNr });
        }
        return tags;
    } else {
        return variables;
    }
}
