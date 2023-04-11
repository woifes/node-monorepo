// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client, Message } from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttConnection,
    MqttMsgHandler,
    tMqttMsgHandlerConfig,
} from "@woifes/mqtt-client/decorator";
import {
    parseS7AddressString,
    S7Endpoint,
    tS7Variable,
} from "@woifes/s7endpoint";
import { Debugger } from "debug";
import * as rt from "runtypes";
import {
    MqttInputConfig,
    tMqttInputConfig,
    tMqttInputTarget,
} from "./MqttInputConfig";

@MqttClient()
export class MqttInput {
    static mqttMsgConfig(this: MqttInput): tMqttMsgHandlerConfig {
        return {
            topic: this._config.topic,
            throttleMS: 300,
        };
    }

    private _debug: Debugger;
    private _config: tMqttInputConfig;
    private _tags: tS7Variable[] = [];
    private _timeout?: NodeJS.Timeout;

    private _s7ep: S7Endpoint;
    private _mqtt: Client;

    constructor(
        config: tMqttInputConfig,
        s7endpoint: S7Endpoint,
        @MqttConnection() mqtt: Client,
        parentDebugger: Debugger,
    ) {
        this._config = MqttInputConfig.check(config);
        this._debug = parentDebugger.extend(`mqttInput:${this._config.topic}`);
        if (Array.isArray(this._config.target)) {
            this.setupArrayTags(this._config.target);
        } else {
            this.setupSingleTag(this._config.target);
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

    private setupArrayTags(tags: tMqttInputTarget[]) {
        for (const tag of tags) {
            this.setupSingleTag(tag);
        }
    }

    private setupSingleTag(tag: tMqttInputTarget) {
        if (rt.String.guard(tag)) {
            this._tags.push(parseS7AddressString(tag));
        } else {
            this._tags.push({
                ...parseS7AddressString(tag.address),
                value: tag.fallbackValue,
            });
        }
    }

    private startTimeout() {
        if (this._config.fallback !== undefined) {
            if (this._timeout !== undefined) {
                clearTimeout(this._timeout);
            }
            this._timeout = setTimeout(
                this.onTimeout.bind(this),
                this._config.fallback!.watchdogTimeMS,
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
        this._debug("Received mqtt message");
        let tags: tS7Variable[] = this.tags;
        if (Array.isArray(this._config.target)) {
            const payload = msg.readJSON();
            if (Array.isArray(payload)) {
                if (
                    this._config.minTargetCount !== undefined &&
                    payload.length < this._config.minTargetCount
                ) {
                    this._debug(
                        `Did not receive minTargetCount ${payload.length}/${this._config.minTargetCount}`,
                    );
                    return;
                }
                const tagsWithValue: tS7Variable[] = [];
                for (let i = 0; i < payload.length; i++) {
                    tagsWithValue.push({ ...tags[i], value: payload[i] });
                }
                tags = tagsWithValue;
            } else {
                this._debug(`Received payload ${payload} is no JSON array`);
                return;
            }
        } else {
            //one target
            tags = tags.splice(0, 1);
            tags[0].value = msg.body;
        }
        this.executeWrite(tags)
            .catch((e) => {
                this._debug(`Error at executeWrite in onMessage(): ${e}`);
            })
            .finally(() => {
                this.startTimeout();
            });
    }
}
