// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { genVariableBuffer } from "../../../src/request";

it("should generate single var", () => {
    const b = genVariableBuffer({
        area: "DB",
        byteIndex: 12,
        type: "INT16",
        value: 1234,
    });
    expect(b.toString("hex")).toBe("04d2");
});

it("should generate array var", () => {
    const b = genVariableBuffer({
        name: "",
        area: "DB",
        byteIndex: 12,
        type: "INT16",
        count: 3,
        value: [1234, 1235, 1236],
    });
    expect(b.toString("hex")).toBe("04d204d304d4");
});

it("should generate bit var", () => {
    const b = genVariableBuffer({
        name: "",
        area: "DB",
        byteIndex: 12,
        bitIndex: 3,
        type: "BIT",
        value: 1,
    });
    expect(b.toString("hex")).toBe("08");
});

it("should generate bit array", () => {
    const b = genVariableBuffer({
        name: "",
        area: "DB",
        byteIndex: 12,
        bitIndex: 6,
        count: 8,
        type: "BIT",
        value: [1, 0, 1, 0, 1, 0, 1, 0],
    });
    expect(b.toString("hex")).toBe("4015");
});
