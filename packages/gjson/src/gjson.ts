// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { handleNextLevel } from "./path/handleNextLevel";
import { splitPath } from "./path/splitPath";

export function get(data: any, path: string) {
    let dataObj: any;
    if (typeof data === "string") {
        dataObj = JSON.parse(data);
    } else {
        dataObj = data;
    }

    const pathItems = splitPath(path);
    try {
        return handleNextLevel(dataObj, pathItems);
    } catch {
        return undefined;
    }
}
