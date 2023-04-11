// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { exec } from "child_process";

export async function pnpmList() {
    return new Promise<[string, string]>((resolve, reject) => {
        exec(
            `pnpm list -P --depth ${Number.MAX_SAFE_INTEGER}`,
            { cwd: process.cwd() },
            (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve([stdout, stderr]);
                }
            },
        );
    });
}
