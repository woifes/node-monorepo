// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { CsvFileHandler } from "@woifes/util";

export function createDbCsvWriter(name: string, dir: string) {
    return new CsvFileHandler(name, dir, {
        maxFileSizeMB: 100,
        fileExtension: ".csv",
        header: [
            "Name",
            "Path",
            "Connection",
            "PLC tag",
            "DataType",
            "Length",
            "Coding",
            "Access Method",
            "Address",
            "Indirect addressing",
            "Index tag",
            "Start value",
            "ID tag",
            "Acquisition mode",
            "Acquisition cycle",
            "Limit Upper 2 Type",
            "Limit Upper 2",
            "Limit Lower 2 Type",
            "Limit Lower 2",
            "Linear scaling",
            "End value PLC",
            "Start value PLC",
            "End value HMI",
            "Start value HMI",
        ],
        addTimeStamp: false,
    });
}
