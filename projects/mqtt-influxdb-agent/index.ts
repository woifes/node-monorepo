// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import { MqttInfluxDbAgent } from "./src/MqttInfluxDbAgent";

const CONFIG_FILE_PATH = process.argv[2] ?? join(__dirname, "config.yaml");

const CONFIG = parse(readFileSync(CONFIG_FILE_PATH, "utf-8"), { merge: true });

const AGENT = new MqttInfluxDbAgent(CONFIG);
