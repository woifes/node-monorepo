// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "fs-extra";
import { join } from "path";
import { parse } from "yaml";
import { S7EventConfig } from "../../src/events/S7EventConfig";

it("should validate example file", () => {
    const p1 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "events",
        "event.example.yaml"
    );
    expect(() => {
        S7EventConfig.check(parse(readFileSync(p1, "utf-8")));
    }).not.toThrow();
});

it("should validate correct runtype", () => {
    expect(() => {
        S7EventConfig.check({
            trigger: "DB1,W4",
            params: ["DB12,DW0", "DB12,I4.3", "DB20,SInt2"],
            pollIntervalMS: 500,
        });
    }).not.toThrow();

    expect(() => {
        S7EventConfig.check({
            trigger: "DB1,W4",
        });
    }).not.toThrow();
});

it("should not allow array or float trigger", () => {
    expect(() => {
        S7EventConfig.check({
            trigger: "DB1,W4.3",
            params: ["DB12,DW0", "DB12,I4.3", "DB20,SInt2"],
            pollIntervalMS: 500,
        });
    }).toThrow();

    expect(() => {
        S7EventConfig.check({
            trigger: "DB1,R4",
            params: ["DB12,DW0", "DB12,I4.3", "DB20,SInt2"],
            pollIntervalMS: 500,
        });
    }).toThrow();
});

it("should not allow negative poll interval", () => {
    expect(() => {
        S7EventConfig.check({
            trigger: "DB1,W4",
            params: ["DB12,DW0", "DB12,I4.3", "DB20,SInt2"],
            pollIntervalMS: -1,
        });
    }).toThrow();
});
