// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { tJsVal, tVal } from "./TypeList";

export interface DataType {
    size: number;
    check(val: tVal, littleEndian?: boolean): tJsVal;
    validate(val: tVal): boolean;
    toBuffer(val: tVal, littleEndian?: boolean): Buffer;
    fromBuffer(buf: Buffer, littleEndian?: boolean): tJsVal;
    toString(val: tVal, littleEndian?: boolean): string;
    fromString(str: string): tJsVal;
}
