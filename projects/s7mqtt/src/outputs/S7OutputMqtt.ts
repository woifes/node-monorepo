// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TypeName } from "@woifes/binarytypes";
import { Client, Message } from "@woifes/mqtt-client";
import { S7Endpoint, tS7Variable } from "@woifes/s7endpoint";
import { Debugger } from "debug";
import { S7Output, STD_POLL_INTERVAL_MS } from "./S7Output";
import { S7OutputMqttConfig, tS7OutputMqttConfig } from "./S7OutputMqttConfig";

export class S7OutputMqtt {
    private static normalizeType(
        variable: tS7Variable, //type: TypeName | "BIT" | "ARRAY_OF_BIT"
    ): TypeName {
        if (variable.type === "BIT") {
            if (variable.count !== undefined && variable.count > 1)
                return "ARRAY_OF_UINT8";
            else {
                return "UINT8";
            }
        } else {
            if (variable.count !== undefined && variable.count > 1) {
                return `ARRAY_OF_${variable.type}`;
            } else {
                return variable.type;
            }
        }
    }

    private _topicPrefix: string;
    private _qos: 0 | 1 | 2;
    private _retain: boolean;

    private _mqtt: Client;
    private _s7ep: S7Endpoint;
    private _s7out: S7Output;
    private _debug: Debugger;
    private _config: tS7OutputMqttConfig;

    constructor(
        config: tS7OutputMqttConfig,
        s7endpoint: S7Endpoint,
        mqtt: Client,
        parentDebugger: Debugger,
    ) {
        this._config = S7OutputMqttConfig.check(config);
        this._s7ep = s7endpoint;
        this._mqtt = mqtt;
        this._debug = parentDebugger.extend(
            `mqttOutput:${this._config.pollIntervalMS ?? STD_POLL_INTERVAL_MS}`,
        );
        this._s7out = new S7Output(this._config, this._s7ep, this._debug);
        this._s7out.on("data", this.onData.bind(this));
        this._topicPrefix = this._config.topicPrefix ?? "tags";
        this._qos = this._config.qos ?? 0;
        this._retain = this._config.retain ?? false;
    }

    private onData(result: tS7Variable[]) {
        this._debug("Received new data");
        for (const key in result) {
            const tag = result[key];
            this.sendValue(tag);
        }
    }

    private sendValue(tag: tS7Variable) {
        const topic = `${this._topicPrefix}/${tag.name as string}`;
        const msg = new Message(topic, this._qos, this._retain);
        if (msg.writeValue(tag.value as any, S7OutputMqtt.normalizeType(tag))) {
            this._mqtt.publishMessageSync(msg);
            return;
        }
        this._debug(
            `Tag at index ${tag.byteIndex} does not confirm to datatype ${tag.type}`,
        );
    }
}
