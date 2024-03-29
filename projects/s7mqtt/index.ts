// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { join } from "path";
import { readFileSync } from "fs-extra";
import { parse } from "yaml";
import { S7Mqtt } from "./src/S7Mqtt";

const CONFIG_FILE_PATH = process.argv[2] ?? join(__dirname, "config.yaml");

const CONFIG = parse(readFileSync(CONFIG_FILE_PATH, "utf-8"), { merge: true });

const S7MQTT = new S7Mqtt(CONFIG);
