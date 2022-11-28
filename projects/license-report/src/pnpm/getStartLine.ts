// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

export function getStartLine(originalLines: string[]): number {
    const dependenciesRegEx = /dependencies:/;
    const startLine = originalLines.find((line) => {
        return line.match(dependenciesRegEx);
    });
    return originalLines.indexOf(startLine!) + 1;
}
