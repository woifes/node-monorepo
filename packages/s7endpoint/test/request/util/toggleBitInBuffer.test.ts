// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { toggleBitInBuffer } from "../../../src/request";

it("should toggle bit in buffer", () => {
    let b = Buffer.alloc(3);
    toggleBitInBuffer(b, 3);
    toggleBitInBuffer(b, 9);
    toggleBitInBuffer(b, 16);
    expect(b.toString("hex")).toBe("080201");

    b = Buffer.from("FFFFFF", "hex");
    toggleBitInBuffer(b, 3);
    toggleBitInBuffer(b, 9);
    toggleBitInBuffer(b, 16);
    expect(b.toString("hex")).toBe("f7fdfe");
});
