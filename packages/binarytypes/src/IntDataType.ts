// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Runtype } from "runtypes";
import { normalizeBigInt } from "./checkInteger";
import { DataType } from "./DataType";
import {
    rtINT16,
    rtINT32,
    rtINT64,
    rtINT8,
    rtUINT16,
    rtUINT32,
    rtUINT64,
    rtUINT8,
} from "./datatypeRuntypes";
import { tJsVal, tVal } from "./TypeList";

export class IntDataType implements DataType {
    private _rt: Runtype;
    /**
     *
     * @param _size
     * @param _signed
     */
    constructor(protected _size: 1 | 2 | 4 | 8, protected _signed: boolean) {
        if (this._signed) {
            switch (this._size) {
                case 1:
                    this._rt = rtINT8;
                    break;
                case 2:
                    this._rt = rtINT16;
                    break;
                case 4:
                    this._rt = rtINT32;
                    break;
                case 8:
                    this._rt = rtINT64;
                    break;
            }
        } else {
            switch (this._size) {
                case 1:
                    this._rt = rtUINT8;
                    break;
                case 2:
                    this._rt = rtUINT16;
                    break;
                case 4:
                    this._rt = rtUINT32;
                    break;
                case 8:
                    this._rt = rtUINT64;
                    break;
            }
        }
    }
    get size() {
        return this._size;
    }

    /**
     * no checking! Has to be done outside!
     * @param buf
     * @param littleEndian
     * @returns
     */
    protected readFromBuffer(
        buf: Buffer,
        littleEndian = true,
    ): number | bigint {
        let n: number | bigint;

        if (littleEndian) {
            if (this._signed) {
                switch (this._size) {
                    case 1:
                        n = buf.readInt8();
                        break;
                    case 2:
                        n = buf.readInt16LE();
                        break;
                    case 4:
                        n = buf.readInt32LE();
                        break;
                    case 8:
                        n = buf.readBigInt64LE();
                        break;
                }
            } else {
                switch (this._size) {
                    case 1:
                        n = buf.readUInt8();
                        break;
                    case 2:
                        n = buf.readUInt16LE();
                        break;
                    case 4:
                        n = buf.readUInt32LE();
                        break;
                    case 8:
                        n = buf.readBigUInt64LE();
                        break;
                }
            }
        } else {
            if (this._signed) {
                switch (this._size) {
                    case 1:
                        n = buf.readInt8();
                        break;
                    case 2:
                        n = buf.readInt16BE();
                        break;
                    case 4:
                        n = buf.readInt32BE();
                        break;
                    case 8:
                        n = buf.readBigInt64BE();
                        break;
                }
            } else {
                switch (this._size) {
                    case 1:
                        n = buf.readUInt8();
                        break;
                    case 2:
                        n = buf.readUInt16BE();
                        break;
                    case 4:
                        n = buf.readUInt32BE();
                        break;
                    case 8:
                        n = buf.readBigUInt64BE();
                        break;
                }
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
    protected writeToBuffer(
        buf: Buffer,
        val: number | bigint,
        littleEndian = true,
    ) {
        if (littleEndian) {
            if (this._signed) {
                switch (this._size) {
                    case 1:
                        buf.writeInt8(val as any);
                        break;
                    case 2:
                        buf.writeInt16LE(val as any);
                        break;
                    case 4:
                        buf.writeInt32LE(val as any);
                        break;
                    case 8:
                        buf.writeBigInt64LE(val as any);
                        break;
                }
            } else {
                switch (this._size) {
                    case 1:
                        buf.writeUInt8(val as any);
                        break;
                    case 2:
                        buf.writeUInt16LE(val as any);
                        break;
                    case 4:
                        buf.writeUInt32LE(val as any);
                        break;
                    case 8:
                        buf.writeBigUInt64LE(val as any);
                        break;
                }
            }
        } else {
            if (this._signed) {
                switch (this._size) {
                    case 1:
                        buf.writeInt8(val as any);
                        break;
                    case 2:
                        buf.writeInt16BE(val as any);
                        break;
                    case 4:
                        buf.writeInt32BE(val as any);
                        break;
                    case 8:
                        buf.writeBigInt64BE(val as any);
                        break;
                }
            } else {
                switch (this._size) {
                    case 1:
                        buf.writeUInt8(val as any);
                        break;
                    case 2:
                        buf.writeUInt16BE(val as any);
                        break;
                    case 4:
                        buf.writeUInt32BE(val as any);
                        break;
                    case 8:
                        buf.writeBigUInt64BE(val as any);
                        break;
                }
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
            const n = normalizeBigInt(<any>val);
            if (this._size === 8) {
                return n;
            } else {
                return Number(n);
            }
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
