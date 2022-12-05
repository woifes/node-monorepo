// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { setBitInBuffer } from "./setBitInBuffer";

export function toggleBitInBuffer(buf: Buffer, bitIndex: number) {
    const byteIndex = Math.floor(bitIndex / 8);
    const bitIndexTmp = bitIndex % 8;
    if (buf.length >= byteIndex + 1) {
        let bit = (buf[byteIndex] & (0x1 << bitIndexTmp)) > 0 ? true : false;
        bit = !bit;
        setBitInBuffer(bit, buf, bitIndex);
    } else {
        throw new Error(
            "could not toggle bit in buffer because buffer size did not fit"
        );
    }
}
