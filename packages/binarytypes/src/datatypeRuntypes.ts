// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import * as rt from "runtypes";
import { checkIntSize } from "./checkInteger";

const rtBuffer = rt.Record({}).withConstraint((b) => Buffer.isBuffer(b));
/**
 * Runtype which validates for a 1 byte signed integer:
 * * Buffer with length == 1
 * * Number in certain bounds
 * * BigInt in certain bounds
 * * String which can be parsed to number in certain bounds
 */
export const rtINT8 = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 1)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => checkIntSize(n, true, 1))
    );
/**
 * Runtype which validates for a 1 byte unsigned integer:
 * * Buffer with length == 1
 * * Number in certain bounds
 * * BigInt in certain bounds
 * * String which can be parsed to number in certain bounds
 */
export const rtUINT8 = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 1)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => checkIntSize(n, false, 1))
    );
/**
 * Runtype which validates for a 2 byte signed integer:
 * * Buffer with length == 2
 * * Number in certain bounds
 * * BigInt in certain bounds
 * * String which can be parsed to number in certain bounds
 */
export const rtINT16 = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 2)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => checkIntSize(n, true, 2))
    );
/**
 * Runtype which validates for a 2 byte unsigned integer:
 * * Buffer with length == 2
 * * Number in certain bounds
 * * BigInt in certain bounds
 * * String which can be parsed to number in certain bounds
 */
export const rtUINT16 = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 2)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => checkIntSize(n, false, 2))
    );
/**
 * Runtype which validates for a 4 byte signed integer:
 * * Buffer with length == 4
 * * Number in certain bounds
 * * BigInt in certain bounds
 * * String which can be parsed to number in certain bounds
 */
export const rtINT32 = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 4)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => checkIntSize(n, true, 4))
    );
/**
 * Runtype which validates for a 4 byte unsigned integer:
 * * Buffer with length == 4
 * * Number in certain bounds
 * * BigInt in certain bounds
 * * String which can be parsed to number in certain bounds
 */
export const rtUINT32 = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 4)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => checkIntSize(n, false, 4))
    );
/**
 * Runtype which validates for a 8 byte signed integer:
 * * Buffer with length == 8
 * * Number in certain bounds
 * * BigInt in certain bounds
 * * String which can be parsed to number in certain bounds
 */
export const rtINT64 = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 8)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => checkIntSize(n, true, 8))
    );
/**
 * Runtype which validates for a 8 byte unsigned integer:
 * * Buffer with length == 8
 * * Number in certain bounds
 * * BigInt in certain bounds
 * * String which can be parsed to number in certain bounds
 */
export const rtUINT64 = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 8)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => checkIntSize(n, false, 8))
    );
/**
 * Runtype which validates for a 4 byte floating point:
 * * Buffer with length == 4
 * * Number (NO NaN, Infinity and -Infinity)
 * * BigInt
 */
export const rtFLOAT = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 4)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => {
                if (typeof n == "string") {
                    const p = parseFloat(n);
                    return Number.isFinite(p);
                } else if (typeof n == "number") {
                    //Number should be a number
                    return Number.isFinite(n);
                } else {
                    return true; //BigInt no problem
                }
            })
    );
/**
 * Runtype which validates for a 8 byte floating point:
 * * Buffer with length == 8
 * * Number (NO NaN, Infinity and -Infinity)
 * * BigInt
 */
export const rtDOUBLE = rtBuffer
    .withConstraint((b) => (b as Buffer).length == 8)
    .Or(
        rt.Number.Or(rt.BigInt)
            .Or(rt.String)
            .withConstraint((n) => {
                if (typeof n == "string") {
                    const p = parseFloat(n);
                    return Number.isFinite(p);
                } else if (typeof n == "number") {
                    //Number should be a number
                    return Number.isFinite(n);
                } else {
                    return true; //BigInt no problem
                }
            })
    );
/**
 * Runtype which validates for a string (or Buffer)
 */
export const rtString = rtBuffer.Or(rt.String);
/**
 * Runtype which validates for an array of 1 byte signed integers
 * * Buffer whith length > 0
 * * String which can be parsed to an array of rtINT8
 * * Plain array of rtINT8
 */
export const rtARRAY_OF_INT8 = rtBuffer
    .withConstraint((b) => (b as Buffer).length > 0)
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtINT8).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtINT8));
/**
 * Runtype which validates for an array of 1 byte unsigned integers
 * * Buffer whith length > 0
 * * String which can be parsed to an array of rtUINT8
 * * Plain array of rtUINT8
 */
export const rtARRAY_OF_UINT8 = rtBuffer
    .withConstraint((b) => (b as Buffer).length > 0)
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtUINT8).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtUINT8));
/**
 * Runtype which validates for an array of 2 byte signed integers
 * * Buffer whith length > 0 && length % 2 == 0
 * * String which can be parsed to an array of rtINT16
 * * Plain array of rtINT16
 */
export const rtARRAY_OF_INT16 = rtBuffer
    .withConstraint(
        (b) => (b as Buffer).length > 0 && (b as Buffer).length % 2 == 0
    )
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtINT16).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtINT16));
/**
 * Runtype which validates for an array of 2 byte unsigned integers
 * * Buffer whith length > 0 && length % 2 == 0
 * * String which can be parsed to an array of rtUINT16
 * * Plain array of rtUINT16
 */
export const rtARRAY_OF_UINT16 = rtBuffer
    .withConstraint(
        (b) => (b as Buffer).length > 0 && (b as Buffer).length % 2 == 0
    )
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtUINT16).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtUINT16));
/**
 * Runtype which validates for an array of 4 byte signed integers
 * * Buffer whith length > 0 && length % 4 == 0
 * * String which can be parsed to an array of rtINT32
 * * Plain array of rtINT32
 */
export const rtARRAY_OF_INT32 = rtBuffer
    .withConstraint(
        (b) => (b as Buffer).length > 0 && (b as Buffer).length % 4 == 0
    )
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtINT32).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtINT32));
/**
 * Runtype which validates for an array of 4 byte unsigned integers
 * * Buffer whith length > 0 && length % 4 == 0
 * * String which can be parsed to an array of rtUINT32
 * * Plain array of rtUINT32
 */
export const rtARRAY_OF_UINT32 = rtBuffer
    .withConstraint(
        (b) => (b as Buffer).length > 0 && (b as Buffer).length % 4 == 0
    )
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtUINT32).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtUINT32));
/**
 * Runtype which validates for an array of 8 byte signed integers
 * * Buffer whith length > 0 && length % 8 == 0
 * * String which can be parsed to an array of rtINT64
 * * Plain array of rtINT64
 */
export const rtARRAY_OF_INT64 = rtBuffer
    .withConstraint(
        (b) => (b as Buffer).length > 0 && (b as Buffer).length % 8 == 0
    )
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtINT64).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtINT64));
/**
 * Runtype which validates for an array of 8 byte unsigned integers
 * * Buffer whith length > 0 && length % 8 == 0
 * * String which can be parsed to an array of rtUINT64
 * * Plain array of rtUINT64
 */
export const rtARRAY_OF_UINT64 = rtBuffer
    .withConstraint(
        (b) => (b as Buffer).length > 0 && (b as Buffer).length % 8 == 0
    )
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtUINT64).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtUINT64));
/**
 * Runtype which validates for an array of 4 byte floats
 * * Buffer with length > 0 && length % 4 == 0
 * * String which can be parsed to an array of rtFLOAT
 * * Plain array of rtFLOAT
 */
export const rtARRAY_OF_FLOAT = rtBuffer
    .withConstraint(
        (b) => (b as Buffer).length > 0 && (b as Buffer).length % 4 == 0
    )
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtFLOAT).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtFLOAT));
/**
 * Runtype which validates for an array of 8 byte floats
 * * Buffer with length > 0 && length % 8 == 0
 * * String which can be parsed to an array of rtDOUBLE
 * * Plain array of rtDOUBLE
 */
export const rtARRAY_OF_DOUBLE = rtBuffer
    .withConstraint(
        (b) => (b as Buffer).length > 0 && (b as Buffer).length % 8 == 0
    )
    .Or(
        rt.String.withConstraint((s) => {
            try {
                return rt.Array(rtDOUBLE).validate(JSON.parse(s)).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rtDOUBLE));
/**
 * Runtype for an array of string. This can be either
 * * a ascii encoded Buffer which can be serialized to a string array
 * * a string which can be parsed to a string array
 * * an array of string
 * * an array of Buffers (ascii encoded)
 */
export const rtARRAY_OF_STRING = rtBuffer
    .withConstraint((b) => {
        const s = (b as Buffer).toString("ascii");
        try {
            const a = JSON.parse(s);
            return rt.Array(rtString).validate(a).success;
        } catch {
            return false;
        }
    })
    .Or(
        rt.String.withConstraint((s) => {
            try {
                const a = JSON.parse(s);
                return rt.Array(rtString).validate(a).success;
            } catch {
                return false;
            }
        })
    )
    .Or(rt.Array(rt.String));
