// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

export function parseLine(line: string): {
    packageName: string;
    packageVersion: string;
    packageLicense: string;
} {
    console.error(`Parse line: ${line}`);
    const lineParts = line.split(" ");
    const packageName = lineParts.at(-4)!.trim();
    const packageVersion = lineParts.at(-3)!.trim();
    const packageLicense = lineParts.at(-1)!.trim();
    return {
        packageName,
        packageVersion,
        packageLicense,
    };
}
