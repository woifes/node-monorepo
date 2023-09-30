// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Runtype } from "runtypes";
import { DataType } from "./DataType";
import { FloatDataType } from "./FloatDataType";
import { tJsVal, tVal } from "./TypeList";
import { rtARRAY_OF_DOUBLE, rtARRAY_OF_FLOAT } from "./datatypeRuntypes";

export class FloatArrDataType extends FloatDataType implements DataType {
    protected _rtArr: Runtype;
    constructor(size: 4 | 8) {
        super(size);
        switch (this._size) {
            case 4:
                this._rtArr = rtARRAY_OF_FLOAT;
                break;
            case 8:
                this._rtArr = rtARRAY_OF_DOUBLE;
                break;
        }
    }

    /**
     * no checking! Has to be done before calling this function!
     * @param buf
     * @param littleEndian
     * @returns
     */
    private readArrayFromBuffer(buf: Buffer, littleEndian = true): number[] {
        const n: number[] = [];
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
     * No checking! Has to be done before calling this function!
     * @param buf
     * @param val
     * @param littleEndian
     */
    private writeArrayToBuffer(
        buf: Buffer,
        val: number[],
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
        return this._rtArr.validate(val).success;
    }

    /**
     * Assumes the value was already checked
     * @param val
     */
    protected _toJsArrVal(val: tVal, littleEndian = true): number[] {
        if (Buffer.isBuffer(val)) {
            return this.readArrayFromBuffer(val, littleEndian);
        } else {
            if (typeof val === "string") {
                val = JSON.parse(val);
            }
            const res: number[] = [];
            for (let i = 0; i < (val as any[]).length; i++) {
                res[i] = <number>(
                    super._toJsVal((val as any[])[i], littleEndian)
                );
            }
            return res;
        }
    }
    /**
     * Generates a Buffer where the given value is written to
     * @param value The value to write
     * @returns The buffer with the written value. Empty buffer if something went wrong
     */
    toBuffer(value: tVal, littleEndian = true): Buffer {
        const v = this.check(value, littleEndian);
        if (Buffer.isBuffer(value)) {
            return value;
        }
        const b = Buffer.alloc(this._size * (v as any[]).length);
        this.writeArrayToBuffer(b, v as any, littleEndian);
        return b;
    }

    fromBuffer(buf: Buffer, littleEndian = true): tJsVal {
        return this.check(buf, littleEndian);
    }

    toString(val: tVal, littleEndian = true): string {
        const v = this.check(val, littleEndian);
        return JSON.stringify(v);
    }

    fromString(str: string): tJsVal {
        return this.check(str);
    }
}
