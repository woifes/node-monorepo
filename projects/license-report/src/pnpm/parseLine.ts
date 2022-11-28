// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

export function parseLine(line: string): [string, string] {
    const lineParts = line.split(" ");
    const packageVersion = lineParts.at(-1)!.trim();
    const packageName = lineParts.at(-2)!.trim();
    return [packageName, packageVersion];
}
