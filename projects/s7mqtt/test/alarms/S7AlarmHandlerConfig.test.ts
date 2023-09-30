// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { join } from "path";
import { readFileSync } from "fs-extra";
import { parse } from "yaml";
import { S7AlarmHandlerConfig } from "../../src/alarms/S7AlarmHandlerConfig";

it("should validate example files", () => {
    const p1 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "alarms",
        "alarm01.example.yaml",
    );
    expect(() => {
        S7AlarmHandlerConfig.check(parse(readFileSync(p1, "utf-8")));
    }).not.toThrow();
    const p2 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "alarms",
        "alarm02.example.yaml",
    );
    expect(() => {
        S7AlarmHandlerConfig.check(parse(readFileSync(p2, "utf-8")));
    }).not.toThrow();
});
