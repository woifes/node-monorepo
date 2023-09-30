// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Runtype } from "runtypes";
import { DataType } from "./DataType";
import { IntDataType } from "./IntDataType";
import { tJsVal, tVal } from "./TypeList";
import {
    rtARRAY_OF_INT8,
    rtARRAY_OF_INT16,
    rtARRAY_OF_INT32,
    rtARRAY_OF_INT64,
    rtARRAY_OF_UINT8,
    rtARRAY_OF_UINT16,
    rtARRAY_OF_UINT32,
    rtARRAY_OF_UINT64,
} from "./datatypeRuntypes";

export class IntArrDataType extends IntDataType implements DataType {
    private _rtArray: Runtype;

    constructor(_size: 1 | 2 | 4 | 8, _signed: boolean) {
        super(_size, _signed);
        if (this._signed) {
            switch (this._size) {
                case 1:
                    this._rtArray = rtARRAY_OF_INT8;
                    break;
                case 2:
                    this._rtArray = rtARRAY_OF_INT16;
                    break;
                case 4:
                    this._rtArray = rtARRAY_OF_INT32;
                    break;
                case 8:
                    this._rtArray = rtARRAY_OF_INT64;
                    break;
            }
        } else {
            switch (this._size) {
                case 1:
                    this._rtArray = rtARRAY_OF_UINT8;
                    break;
                case 2:
                    this._rtArray = rtARRAY_OF_UINT16;
                    break;
                case 4:
                    this._rtArray = rtARRAY_OF_UINT32;
                    break;
                case 8:
                    this._rtArray = rtARRAY_OF_UINT64;
                    break;
            }
        }
    }

    /**
     * no checking! Has to be done outside!
     * @param buf
     * @param littleEndian
     * @returns
     */
    private readArrayFromBuffer(
        buf: Buffer,
        littleEndian = true,
    ): number[] | bigint[] {
        const n: number[] | bigint[] = [];
        let j = 0;
        for (let i = 0; i < buf.length; i = i + this._size) {
            n[j] = super.readFromBuffer(
                buf.slice(i, i + this._size),
                littleEndian,
            );
            j++;
        }
        return n;
    }

    /**
     * No checking! Has to be done outside!
     * @param buf
     * @param val
     * @param littleEndian
     */
    private writeArrayToBuffer(
        buf: Buffer,
        val: number[] | bigint[],
        littleEndian = true,
    ) {
        let j = 0;
        for (let i = 0; i < buf.length; i = i + this._size) {
            super.writeToBuffer(
                buf.slice(i, i + this._size),
                val[j],
                littleEndian,
            );
            j++;
        }
    }

    check(val: tVal, littleEndian = true): tJsVal {
        if (this.validate(val)) {
            return this._toJsArrVal(val, littleEndian);
        } else {
            throw new Error(`Could not transform value to jsTagValue: ${val}`);
        }
    }

    validate(val: tVal): boolean {
        return this._rtArray.validate(val).success;
    }

    /**
     * Assumes the value was already checked
     * @param val
     */
    private _toJsArrVal(val: tVal, littleEndian = true): number[] | bigint[] {
        let value = val;
        if (Buffer.isBuffer(value)) {
            return this.readArrayFromBuffer(value, littleEndian);
        } else {
            //Array
            if (typeof value === "string") {
                value = JSON.parse(value);
            }
            const res: number[] | bigint[] = [];
            for (let i = 0; i < (value as any[]).length; i++) {
                res[i] = super._toJsVal((value as any[])[i], littleEndian);
            }
            return res;
        }
    }
    /**
     * Generates a Buffer where the given value is written to
     * @param value The value to write
     * @returns The buffer with the written value. Empty buffer if something went wrong
     */
    toBuffer(val: tVal, littleEndian = true): Buffer {
        const v = this.check(val, littleEndian);
        if (Buffer.isBuffer(val)) {
            return val;
        }
        const b = Buffer.alloc(this._size * (v as any[]).length);
        this.writeArrayToBuffer(b, v as any, littleEndian);
        return b;
    }

    toString(val: tVal, littleEndian = true): string {
        const v = this.check(val, littleEndian);
        if (this._size > 4) {
            //bigint has to be parsed as string array
            const res = [];
            for (let i = 0; i < (v as any[]).length; i++) {
                res[i] = `${(v as bigint[])[i]}`;
            }
            return JSON.stringify(res);
        }
        return JSON.stringify(v);
    }
}
