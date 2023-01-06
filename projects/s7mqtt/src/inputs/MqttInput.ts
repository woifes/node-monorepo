// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client, Message } from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttConnection,
    MqttMsgHandler,
    tMqttMsgHandlerConfig,
} from "@woifes/mqtt-client/decorator";
import { S7Endpoint, tS7Variable } from "@woifes/s7endpoint";
import { MqttInputConfig, tMqttInputConfig } from "./MqttInputConfig";

@MqttClient()
export class MqttInput {
    static mqttMsgConfig(this: MqttInput): tMqttMsgHandlerConfig {
        return {
            topic: this._config.topic,
            throttleMS: 300,
        };
    }

    private _config: tMqttInputConfig;
    private _tags: tS7Variable[] = [];
    private _timeout?: NodeJS.Timeout;

    private _s7ep: S7Endpoint;
    private _mqtt: Client;

    constructor(
        config: tMqttInputConfig,
        s7endpoint: S7Endpoint,
        @MqttConnection() mqtt: Client
    ) {
        this._config = MqttInputConfig.check(config);
        if (Array.isArray(this._config.target)) {
            for (const value of this._config.target) {
                this._tags.push({
                    ...value,
                });
            }
        } else {
            this._tags.push({
                ...this._config.target,
            });
        }
        this._s7ep = s7endpoint;
        this._mqtt = mqtt;
        this.startTimeout();
    }

    get tags(): tS7Variable[] {
        const variables: tS7Variable[] = [];
        for (const variable of this._tags) {
            variables.push({
                area: variable.area,
                dbNr: variable.dbNr,
                byteIndex: variable.byteIndex,
                bitIndex: variable.bitIndex,
                type: variable.type,
                count: variable.count,
            });
        }
        return variables;
    }

    private startTimeout() {
        if (this._config.fallback != undefined) {
            if (this._timeout != undefined) {
                clearTimeout(this._timeout);
            }
            this._timeout = setTimeout(
                this.onTimeout.bind(this),
                this._config.fallback!.watchdogTimeMS
            );
        }
    }

    private onTimeout() {
        this.executeWrite(this._tags).catch(() => {
            this.startTimeout();
        });
    }

    private async executeWrite(tags: tS7Variable[]) {
        const writeReq = this._s7ep.createWriteRequest(tags);
        return writeReq.execute();
    }

    @MqttMsgHandler(MqttInput.mqttMsgConfig)
    onMessage(msg: Message) {
        let tags: tS7Variable[] = this.tags;
        if (Array.isArray(this._config.target)) {
            const payload = msg.readJSON();
            if (Array.isArray(payload)) {
                if (
                    this._config.minTargetCount != undefined &&
                    payload.length < this._config.minTargetCount
                ) {
                    //TODO debug
                    return;
                }
                const tagsWithValue: tS7Variable[] = [];
                for (let i = 0; i < payload.length; i++) {
                    tagsWithValue.push({ ...tags[i], value: payload[i] });
                }
                tags = tagsWithValue;
            } else {
                //TODO debug
                return;
            }
        } else {
            //one target
            tags = tags.splice(0, 1);
            tags[0].value = msg.body;
        }
        this.executeWrite(tags)
            .catch(() => {
                //TODO debug
            })
            .finally(() => {
                this.startTimeout();
            });
    }
}
