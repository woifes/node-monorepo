// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "fs-extra";
import { join } from "path";
import { parse } from "yaml";
import { MatrixMqttBridge } from "./src/MatrixMqttBridge";

const CONFIG_FILE_PATH = process.argv[2] ?? join(__dirname, "config.json");

const CONFIG = parse(readFileSync(CONFIG_FILE_PATH, "utf-8"));

const S7MQTT = new MatrixMqttBridge(CONFIG);
