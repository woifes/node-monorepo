// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Runtype } from "runtypes";
import { DataType } from "./DataType";
import { tJsVal, tVal } from "./TypeList";
import { rtDOUBLE, rtFLOAT } from "./datatypeRuntypes";

export class FloatDataType implements DataType {
    protected _rt: Runtype;
    constructor(protected _size: 4 | 8) {
        switch (this._size) {
            case 4:
                this._rt = rtFLOAT;
                break;
            case 8:
                this._rt = rtDOUBLE;
                break;
        }
    }
    get size(): number {
        return this._size;
    }

    /**
     * no checking! Has to be done outside!
     * @param buf
     * @param littleEndian
     * @returns
     */
    protected readFromBuffer(buf: Buffer, littleEndian = true): number {
        let n: number;
        if (littleEndian) {
            switch (this._size) {
                case 4:
                    n = buf.readFloatLE();
                    break;
                case 8:
                    n = buf.readDoubleLE();
                    break;
            }
        } else {
            switch (this._size) {
                case 4:
                    n = buf.readFloatBE();
                    break;
                case 8:
                    n = buf.readDoubleBE();
                    break;
            }
        }
        return n;
    }

    /**
     * No checking! Has to be done outside!
     * @param buf
     * @param val
     * @param littleEndian
     */
    protected writeToBuffer(buf: Buffer, val: number, littleEndian = true) {
        if (littleEndian) {
            switch (this._size) {
                case 4:
                    buf.writeFloatLE(val);
                    break;
                case 8:
                    buf.writeDoubleLE(val);
                    break;
            }
        } else {
            switch (this._size) {
                case 4:
                    buf.writeFloatBE(val);
                    break;
                case 8:
                    buf.writeDoubleBE(val);
                    break;
            }
        }
    }

    check(val: tVal, littleEndian = true): tJsVal {
        if (this.validate(val)) {
            return this._toJsVal(val, littleEndian);
        } else {
            throw new Error(`Could not transform value to jsTagValue: ${val}`);
        }
    }

    validate(val: tVal): boolean {
        return this._rt.validate(val).success;
    }

    /**
     * Assumes the value was already checked
     * @param val
     */
    protected _toJsVal(val: tVal, littleEndian = true): number | bigint {
        if (Buffer.isBuffer(val)) {
            return this.readFromBuffer(val, littleEndian);
        } else {
            return Number(val);
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
        const b = Buffer.alloc(this._size);
        this.writeToBuffer(b, v as any, littleEndian);
        return b;
    }

    fromBuffer(buf: Buffer, littleEndian = true): tJsVal {
        return this.check(buf, littleEndian);
    }

    toString(val: tVal, littleEndian = true): string {
        const v = this.check(val, littleEndian);
        return `${v}`;
    }

    fromString(str: string): tJsVal {
        return this.check(str);
    }
}
