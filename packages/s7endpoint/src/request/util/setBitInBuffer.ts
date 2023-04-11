// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

export function setBitInBuffer(bit: boolean, buf: Buffer, bitIndex: number) {
    const byteIndex = Math.floor(bitIndex / 8);
    bitIndex = bitIndex % 8;
    if (buf.length >= byteIndex + 1) {
        if (bit) {
            buf[byteIndex] |= 0x1 << bitIndex;
        } else {
            buf[byteIndex] &= 0xff ^ (0x1 << bitIndex);
        }
    } else {
        throw new Error(
            "could not set Bit in buffer because buffer size did not fit",
        );
    }
}
