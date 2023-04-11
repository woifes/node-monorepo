// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tJsVal } from "@woifes/binarytypes";
import { Client, Message } from "@woifes/mqtt-client";
import { S7Endpoint, tS7Variable } from "@woifes/s7endpoint";
import { Debugger } from "debug";
import { S7Event } from "./S7Event";
import { tS7EventMqttConfig } from "./S7EventMqttConfig";

export class S7EventMqtt {
    private _debug: Debugger;
    private _config: tS7EventMqttConfig;
    private _mqtt: Client;
    private _s7event: S7Event;
    private _s7ep: S7Endpoint;

    constructor(
        config: tS7EventMqttConfig,
        s7endpoint: S7Endpoint,
        mqtt: Client,
        parentDebugger: Debugger,
    ) {
        this._config = config;
        this._debug = parentDebugger.extend(`mqttEvent:${this._config.topic}`);
        this._s7ep = s7endpoint;
        this._s7event = new S7Event(
            { ...this._config },
            this._s7ep,
            this._debug,
        );
        this._mqtt = mqtt;
        this._s7event.on("trigger", this.onNewTrigger.bind(this));
    }

    private onNewTrigger(newTrigger: tS7Variable, params: tS7Variable[]) {
        let message = "";
        if (this._config.message !== undefined) {
            message = this.replacePlaceholder(
                this._config.message,
                newTrigger,
                params,
            );
        } else {
            const valueList: tJsVal[] = [newTrigger.value as tJsVal];
            for (const parameter of params) {
                valueList.push(parameter.value as tJsVal);
            }
            message = JSON.stringify(valueList);
        }

        const msg = new Message(
            this._config.topic,
            2,
            false,
            message,
            this._mqtt,
        );
        msg.send().catch(() => {
            this._debug("Error at msg.send() in onNewTrigger()");
        });
    }

    private replacePlaceholder(
        message: string,
        newTrigger: tS7Variable,
        params: tS7Variable[],
    ) {
        return message.replaceAll(
            /\$[\d|t]+/g,
            (match: string, ...args: any[]) => {
                const c = match.slice(1);
                const n = parseInt(c);
                if (Number.isFinite(n) && params[n] !== undefined) {
                    return JSON.stringify(params[n].value);
                } else if (c === "t") {
                    return JSON.stringify(newTrigger.value);
                } else {
                    return match;
                }
            },
        );
    }
}
