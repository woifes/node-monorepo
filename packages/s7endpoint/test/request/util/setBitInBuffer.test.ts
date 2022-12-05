// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { setBitInBuffer } from "../../../src/request";

it("should set bit in buffer", () => {
    let b = Buffer.alloc(3);
    setBitInBuffer(true, b, 3);
    setBitInBuffer(true, b, 9);
    setBitInBuffer(true, b, 16);
    expect(b.toString("hex")).toBe("080201");

    b = Buffer.from("FFFFFF", "hex");
    setBitInBuffer(false, b, 3);
    setBitInBuffer(false, b, 9);
    setBitInBuffer(false, b, 16);
    expect(b.toString("hex")).toBe("f7fdfe");
});
