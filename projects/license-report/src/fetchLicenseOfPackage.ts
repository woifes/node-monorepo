// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { readFileSync } from "fs";
import { join, resolve } from "path";
import { Interface } from "readline";
import { question } from "./question";

export async function fetchLicenseOfPackage(
    packageStr: string,
    licenseMap: Map<string, string>,
    licenseCountMap: Map<string, number>,
    existingLicensesMap: Map<string, string>,
    interf: Interface
): Promise<void> {
    let license = existingLicensesMap.get(packageStr);
    if (license == undefined) {
        try {
            console.error(`Fetch for ${packageStr}`);
            //https://registry.npmjs.org/react/17.0.2
            const res = await fetch(`https://registry.npmjs.org/${packageStr}`);
            if (res.status != 200) {
                throw new Error(
                    `Could not fetch meta data of package ${packageStr}`
                );
            }
            const packageJson = await res.json();
            license = (packageJson.license as string) ?? "UNKNOWN";
        } catch {
            try {
                const relativePath = packageStr.split("/link:")[1];
                const packageJson = JSON.parse(
                    readFileSync(
                        join(resolve(relativePath), "package.json"),
                        "utf-8"
                    )
                );
                license = (packageJson.license as string) ?? "UNKNOWN";
            } catch {
                license = await question(
                    `Which license does the package ${packageStr} have?`,
                    "License",
                    interf
                );
            }
        }
    } else {
        console.error(
            `Do not fetch package ${packageStr}, because it was in de previous report file with ${license}`
        );
    }
    licenseMap.set(packageStr, license);
    let licenseCount = licenseCountMap.get(license) ?? 0;
    licenseCount++;
    licenseCountMap.set(license, licenseCount);
}
