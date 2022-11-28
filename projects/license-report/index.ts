#!/usr/bin/env node

// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { writeFileSync } from "fs";
import { join } from "path";
import { createInterface } from "readline";
import { fetchLicenseOfPackage } from "./src/fetchLicenseOfPackage";
import { getAllPackages } from "./src/pnpm/getAllPackages";
import { pnpmList } from "./src/pnpm/pnpmList";
import { readBackExistingReport } from "./src/readBack/readBackExistingReport";
import { renderLicenseTree } from "./src/render/renderLicenseTree";
import { renderSummary } from "./src/render/renderSummary";

(async () => {
    const filePath = join(process.cwd(), "LicenseReport.txt");
    const packageSet = new Set<string>();
    const licenses = new Map<string, string>();
    const licensesCount = new Map<string, number>();
    const existingLicensesMap = readBackExistingReport(filePath);

    const [stdout, stderr] = await pnpmList();

    const lines = getAllPackages(stdout.split("\n"), packageSet);

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    for (const pack of packageSet) {
        await fetchLicenseOfPackage(
            pack,
            licenses,
            licensesCount,
            existingLicensesMap,
            rl
        );
    }

    let fileContent = "";

    fileContent += renderSummary(licensesCount);
    fileContent += renderLicenseTree(lines, licenses);
    fileContent = fileContent.slice(0, fileContent.length - 1); //remove last \n

    writeFileSync(filePath, fileContent);

    process.exit(0);
})();
