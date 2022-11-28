// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { getStartLine } from "./getStartLine";
import { parseLine } from "./parseLine";

/**
 * Parses the output of pnpm list and returns the package tree
 * @param lines the lines of the output of pnpm list
 * @param packageSet a list of all contained packages
 * @returns the lines which hold the dependency tree
 */
export function getAllPackages(lines: string[], packageSet: Set<string>) {
    const startIndex = getStartLine(lines);
    lines = lines.slice(startIndex);

    for (const line of lines) {
        if (line.length < 2) {
            continue;
        }
        const [packageName, packageVersion] = parseLine(line);
        packageSet.add(`${packageName}/${packageVersion}`);
    }

    return lines;
}
