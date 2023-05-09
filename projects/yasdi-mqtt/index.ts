// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { YasdiMqtt } from "./src/YasdiMqtt";
import { readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { parse } from "yaml";

const YASDI_MQTT_SERIAL_DEVICE =
    process.env.YASDI_MQTT_SERIAL_DEVICE ?? "/dev/ttyUSB0";
const YASDI_INI_TMP_DIR = process.env.YASDI_INI_TMP_DIR ?? tmpdir();

const CONFIG_FILE_PATH = process.argv[2] ?? join(__dirname, "config.yaml");

const CONFIG = parse(readFileSync(CONFIG_FILE_PATH, "utf-8"), { merge: true });

const YASDI_MQTT = new YasdiMqtt(
    CONFIG,
    YASDI_INI_TMP_DIR,
    YASDI_MQTT_SERIAL_DEVICE,
);
