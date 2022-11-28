// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

/* eslint-disable no-empty */

import { readFileSync } from "fs";
import { getStartLine } from "./getStartLine";
import { parseLine } from "./parseLine";

export function readBackExistingReport(filePath: string): Map<string, string> {
    const existingLicensesMap = new Map<string, string>();
    try {
        let lines = readFileSync(filePath, { encoding: "utf-8" }).split("\n");
        const startIndex = getStartLine(lines);
        lines = lines.slice(startIndex);

        for (const line of lines) {
            if (line.length == 0) {
                continue;
            }
            const { packageName, packageVersion, packageLicense } =
                parseLine(line);
            existingLicensesMap.set(
                `${packageName}/${packageVersion}`,
                packageLicense
            );
        }
    } catch {}
    return existingLicensesMap;
}
