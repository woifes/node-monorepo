// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

export function renderSummary(licenseCountMap: Map<string, number>) {
    let content = "";

    function print(line: string) {
        console.log(line);
        content += line + "\n";
    }
    print("Dependency License Summary:");
    print("");
    for (const [key, value] of licenseCountMap.entries()) {
        print(`${key} - ${value}`);
    }
    print("");

    return content;
}
