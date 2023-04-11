// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "fs-extra";
import { join } from "path";
import { parse } from "yaml";
import { S7OutputConfig } from "../../src/outputs/S7OutputConfig";

it("should validate example file", () => {
    const p1 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "outputs",
        "output.example.yaml",
    );

    expect(() => {
        S7OutputConfig.check(parse(readFileSync(p1, "utf-8")));
    }).not.toThrow();
});

it("should validate correct runtype", () => {
    expect(() => {
        S7OutputConfig.check({
            tags: {
                tag01: "DB1,W1",
            },
        });
    }).not.toThrow();

    expect(() => {
        S7OutputConfig.check({
            datablocks: [
                {
                    dbNr: 1,
                    filePathOrContent: "path/to/file",
                },
            ],
        });
    }).not.toThrow();

    expect(() => {
        S7OutputConfig.check({
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [
                {
                    dbNr: 1,
                    filePathOrContent: "path/to/file",
                },
            ],
            pollIntervalMS: 123,
        });
    }).not.toThrow();
});

it("should not allow negative poll interval", () => {
    expect(() => {
        S7OutputConfig.check({
            tags: {
                tag01: "DB1,W1",
            },
            datablocks: [
                {
                    dbNr: 1,
                    filePathOrContent: "path/to/file",
                },
            ],
            pollIntervalMS: -1,
        });
    }).toThrow();
});

it("should not allow empty tags object", () => {
    expect(() => {
        S7OutputConfig.check({
            tags: {},
            pollIntervalMS: 123,
        });
    }).toThrow();

    expect(() => {
        S7OutputConfig.check({
            tags: {},
        });
    }).toThrow();
});

it("should not allow empty datablocks array", () => {
    expect(() => {
        S7OutputConfig.check({
            datablocks: [],
            pollIntervalMS: 123,
        });
    }).toThrow();

    expect(() => {
        S7OutputConfig.check({
            datablocks: [],
        });
    }).toThrow();
});
