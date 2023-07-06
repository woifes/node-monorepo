// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "fs-extra";
import { join } from "path";
import { parse } from "yaml";
import { rtLifeSignConfig } from "../../src/lifesign/LifeSignConfig";

it("should validate the example file", () => {
    const p1 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "lifesign",
        "lifesign.example.yaml",
    );
    expect(() => {
        rtLifeSignConfig.check(parse(readFileSync(p1, "utf-8")));
    }).not.toThrow();
});

it("should not validate config with no in and out", () => {
    expect(() => {
        rtLifeSignConfig.check({});
    }).toThrow();
});
