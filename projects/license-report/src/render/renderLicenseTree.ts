// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { parseLine } from "../pnpm/parseLine";

export function renderLicenseTree(
    lines: string[],
    licenseMap: Map<string, string>,
): string {
    let content = "";

    function print(line: string) {
        console.log(line);
        content += `${line}\n`;
    }

    print("Dependency License Tree:");
    print("");
    for (let line of lines) {
        try {
            const [packageName, packageVersion] = parseLine(line);
            if (line.endsWith("\n")) {
                line = line.slice(0, line.length);
            }
            print(
                `${line} - ${licenseMap.get(
                    `${packageName}/${packageVersion}`,
                )}`,
            );
        } catch {
            print(line);
        }
    }
    return content;
}
