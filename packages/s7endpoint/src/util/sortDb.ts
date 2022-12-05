// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { tS7Address } from "../types/S7Address";

/**
 * Sort function to sort after db number and index
 * @param a
 * @param b
 */
export const sortDbAdresses = function (a: tS7Address, b: tS7Address): number {
    if (a.area != b.area && a.area != "DB") {
        throw new Error("Can only sort db addresses");
    }
    if (a.dbNr! < b.dbNr!) {
        return -1;
    } else if (a.dbNr! > b.dbNr!) {
        return 1;
    } else {
        return sortS7Adresses(a, b);
    }
};

/**
 * Sort function to sort after dbIndex
 * @param a
 * @param b
 * @returns
 */
export const sortS7Adresses = function (a: tS7Address, b: tS7Address) {
    if (a.byteIndex < b.byteIndex) {
        return -1;
    } else if (a.byteIndex > b.byteIndex) {
        return 1;
    } else {
        return 0;
    }
};
