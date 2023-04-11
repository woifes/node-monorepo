// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

/**
 * Parses the content of a data block source file generated by TIA Portal
 * @param source The string to parse
 * @returns Nested object where the keys are the names of the variables and the values are either a nested array again for structs
 * or a string with the variable content otherwise
 */
export function parseDBsourceFileString(source: string) {
    let arr = source.split("\n");
    for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].replace(/\s/g, "");
    }
    arr = arr.filter((e, i, arr) => {
        return e.length > 0;
    });
    const n = arr.indexOf("STRUCT");
    if (n === -1) {
        throw new Error("no STRUCT found");
    }
    arr = arr.slice(n + 1);

    const o = parseLines(arr[Symbol.iterator]());
    return o;
}

/**
 * Type for the object returned by "ParseDBsourceFileString"
 */
export type DbObject = {
    [key: string]: string | DbObject;
};

/**
 * Parses the given string iterable as a datablock source line by line
 * @param lineIter the string iterable
 * @returns parsed DbObject
 */
function parseLines(lineIter: IterableIterator<string>): DbObject {
    const obj: DbObject = {};
    for (let line of lineIter) {
        let [name, content] = line.split(":");
        line = line.toUpperCase();
        if (line.indexOf("END_STRUCT") !== -1) {
            return obj;
        } else if (line.indexOf("OFSTRUCT") !== -1) {
            const lower = parseInt(line.split("[")[1].split("..")[0]);
            const upper = parseInt(line.split("]")[0].split("..")[1]);
            const res = parseLines(lineIter);
            const arrayStruct: DbObject = {};
            for (let i = lower; i <= upper; i++) {
                arrayStruct[i] = { ...res };
            }
            obj[name] = arrayStruct;
        } else if (line.indexOf("STRUCT") !== -1) {
            obj[name] = parseLines(lineIter);
        } else {
            if (content === undefined) {
                throw new Error(`Content could not be split by ":" ${line}`);
            }
            if (name.indexOf('"') !== -1) {
                name = name.split('"')[1];
            }
            obj[name] = content;
        }
    }
    throw new Error("no END_STRUCT found!");
}
