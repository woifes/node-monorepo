// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { TypeName } from "./TypeList";

const MAX_INT8 = 2n ** (8n - 1n) - 1n;
const MIN_INT8 = -(2n ** (8n - 1n));
const MAX_INT16 = 2n ** (16n - 1n) - 1n;
const MIN_INT16 = -(2n ** (16n - 1n));
const MAX_INT32 = 2n ** (32n - 1n) - 1n;
const MIN_INT32 = -(2n ** (32n - 1n));
const MAX_INT64 = 2n ** (64n - 1n) - 1n;
const MIN_INT64 = -(2n ** (64n - 1n));

const MAX_UINT8 = 2n ** 8n - 1n;
const MAX_UINT16 = 2n ** 16n - 1n;
const MAX_UINT32 = 2n ** 32n - 1n;
const MAX_UINT64 = 2n ** 64n - 1n;

/**
 * Generates bigint from input. Checks number to be in safe integer bounds. If string given tries to convert it losslessly.
 * Throws if the conditions are not met
 * @param val  the value to normalize. Strings will be parsed from an optional + or - sing up to the first non number character
 * @returns bigint
 */
export const normalizeBigInt = function (
    val: number | bigint | string
): bigint {
    if (typeof val == "number") {
        if (val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) {
            throw new Error(`Number out of bounds`);
        } else {
            val = parseInt(val.toString());
        }
    } else if (typeof val == "string") {
        const res = val.match(/^(\+|-)?[0-9]+/);
        if (res != null && res[0] != undefined) {
            val = res[0];
        } else {
            val = Math.floor(Number(val));
        }
    }
    return BigInt(val);
};

/**
 * Calculates how many bytes are needed to fit the given value
 * If Number exceeds MAX_SAFE_INT and MIN_SAFE_INT -1 is returned
 * @param val the value to check
 * @param signed calc for signed or unsigned integer
 * @returns size in bytes or -1 if not parsable to integer
 */
export const calcIntegerSize = function (
    val: number | bigint | string,
    signed = true
) {
    try {
        const n: bigint = normalizeBigInt(val);

        if (!signed) {
            if (n < 0n) {
                return -1;
            } else if (n <= MAX_UINT8) {
                return 1;
            } else if (n <= MAX_UINT16) {
                return 2;
            } else if (n <= MAX_UINT32) {
                return 4;
            } else if (n <= MAX_UINT64) {
                return 8;
            } else {
                return -1;
            }
        } else {
            if (n >= MIN_INT8 && n <= MAX_INT8) {
                return 1;
            } else if (n >= MIN_INT16 && n <= MAX_INT16) {
                return 2;
            } else if (n >= MIN_INT32 && n <= MAX_INT32) {
                return 4;
            } else if (n >= MIN_INT64 && n <= MAX_INT64) {
                return 8;
            } else {
                return -1;
            }
        }
    } catch {
        return -1;
    }
};

/**
 * Checks if a given value is an integer with a certain size
 * @param val the value to check
 * @param signed specifies if the value is(should be) signed
 * @param bytes the byte size which the integer should have (1|2|4|8)
 * @returns returns the given size if it fit in the byte size given and -1 if something is wrong
 */
export const checkIntSize = function (
    val: number | bigint | string,
    signed = true,
    bytes: 1 | 2 | 4 | 8 = 1
) {
    const size = calcIntegerSize(val, signed);
    if (size == -1) {
        return false;
    }
    return size <= bytes;
};

/**
 * Calculates the smallest fitting array type of the given array
 * @param val the array to test
 * @returns the type name which can be used for further usage. Null on error
 */
export const calcTypeOfArray = function (
    val: number[] | bigint[] | string[]
): TypeName | null {
    let sizeUnsigned = -1;
    let sizeSigned = -1;
    let i = 0;
    if (val.length != 0) {
        sizeUnsigned = 0;
        sizeSigned = 0;
        do {
            const n = val[i];
            let res: number;
            if (sizeSigned != -1) {
                res = calcIntegerSize(n, true);
                if (res == -1) {
                    sizeSigned = -1;
                } else if (res > sizeSigned) {
                    sizeSigned = res;
                }
            }

            if (sizeUnsigned != -1) {
                res = calcIntegerSize(n, false);
                if (res == -1) {
                    sizeUnsigned = -1;
                } else if (res > sizeUnsigned) {
                    sizeUnsigned = res;
                }
            }
            i++;
        } while (i < val.length && !(sizeSigned == -1 && sizeUnsigned == -1));
    }
    if (sizeUnsigned != -1) {
        switch (sizeUnsigned) {
            case 1:
                return "ARRAY_OF_UINT8";
            case 2:
                return "ARRAY_OF_UINT16";
            case 4:
                return "ARRAY_OF_UINT32";
            case 8:
                return "ARRAY_OF_UINT64";
        }
    } else if (sizeSigned != -1) {
        switch (sizeSigned) {
            case 1:
                return "ARRAY_OF_INT8";
            case 2:
                return "ARRAY_OF_INT16";
            case 4:
                return "ARRAY_OF_INT32";
            case 8:
                return "ARRAY_OF_INT64";
        }
    }
    return null;
};
