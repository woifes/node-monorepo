// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { tmpdir } from "os";
import { YasdiRest } from "./src/YasdiRest";

const ID = process.env.YASDI_REST_ID;

const DEVICE_COUNT = parseInt(process.env.YASDI_REST_DEVICE_COUNT ?? "");

const PORT = parseInt(process.env.YASDI_REST_PORT ?? "80");

const SERIAL_DEVICE = process.env.YASDI_REST_SERIAL_DEVICE ?? "/dev/ttyUSB0";

const TMP_DIR = process.env.YASDI_REST_INI_TMP_DIR ?? tmpdir();

const DEBUG = (process.env.YASDI_REST_DEBUG ?? "").toUpperCase();

if (ID === undefined) {
    throw new Error("YASDI_REST_ID not defined");
}
if (!isFinite(DEVICE_COUNT)) {
    throw new Error("YASDI_REST_DEVICE_COUNT not defined");
}

const YASDI_REST = new YasdiRest(
    ID,
    DEVICE_COUNT,
    PORT,
    TMP_DIR,
    SERIAL_DEVICE,
    DEBUG === "TRUE",
);
