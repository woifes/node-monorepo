// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { DBFileDescriptor } from "../../src/parseDbSourceFile";

it("should validate correct type", () => {
    expect(() => {
        DBFileDescriptor.check({
            dbNr: 1,
            filePath: "a/b/c",
        });
    }).not.toThrow();
});

it("should not validate if dbIndex is 0 or lower", () => {
    expect(() => {
        DBFileDescriptor.check({
            dbNr: 0,
            filePath: "a/b/c",
        });
    }).toThrow();
});
