// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Message } from "@woifes/mqtt-client";
import { once } from "events";
import { emptyDirSync, mkdirSync, rmdirSync } from "fs-extra";
import { join, resolve } from "path";
import { EventEmitter } from "stream";
import { S7Mqtt } from "../../src/S7Mqtt";
import { CONFIG } from "./localConfig";

jest.setTimeout(30000);

const TMP_DIR = join(__dirname, "tmp");
emptyDirSync(TMP_DIR);
rmdirSync(TMP_DIR);
mkdirSync(TMP_DIR);

(CONFIG.endpoint as any).datablockCsvDir = resolve(TMP_DIR);

const SERVER = new S7Mqtt(CONFIG);
const EVT = new EventEmitter();
let lastOutput = 0;

const PUBMSGMOCK = (msg: Message) => {
    const topicStr = msg.topic.join("/");
    if (topicStr === "a/b/c") {
        EVT.emit("mqttEvent");
    }
    if (topicStr === "plc01/tag01") {
        const outValue = msg.readValue("UINT32") as number;
        if (outValue !== lastOutput) {
            console.log("new out value");
            EVT.emit("mqttOutputChanged");
        }
        lastOutput = outValue;
    }
    return Promise.resolve();
};
(SERVER as any)._mqtt.publishMessage = PUBMSGMOCK;

function simulateIncMsg(msg: Message) {
    (SERVER as any)._mqtt.onMessageCallback(
        msg.topic.join("/"),
        msg.body,
        msg.publishOpts,
    );
}

describe("event test", () => {
    it("should emit event", async () => {
        console.log("Please trigger the mqtt event from the source");
        await once(EVT, "mqttEvent");
    });
});

describe("output test", () => {
    it("should publish output state", async () => {
        console.log("Please change the output value");

        await once(EVT, "mqttOutputChanged");
    });
});

describe("input test", () => {
    it("should change input", async () => {
        const msg = new Message("inputs/first");
        msg.writeValue(Math.floor(Math.random() * 100 + 1), "UINT8");
        simulateIncMsg(msg);

        console.log("If the input value did change trigger the event");
        await once(EVT, "mqttEvent");
    });
});
