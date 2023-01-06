// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tJsVal, TypeName } from "@woifes/binarytypes";
import { Client, Message } from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttCmdHandler,
    MqttConnection,
    tMqttCmdHandlerConfig,
} from "@woifes/mqtt-client/decorator";
import {
    parseS7AddressString,
    S7Endpoint,
    tS7Address,
    tS7Variable,
    WriteRequest,
} from "@woifes/s7endpoint";
import { EventEmitter, once } from "events";
import { S7Event } from "../events/S7Event";
import { S7CommandConfig, tS7CommandConfig } from "./S7CommandConfig";

@MqttClient()
export class S7Command extends EventEmitter {
    static mqttCmdConfig(this: S7Command): tMqttCmdHandlerConfig {
        const prefix = this._config.topicPrefix ?? "cmd";
        return {
            topic: `${prefix}/${this._mqtt.clientId}/+/${this._config.name}`,
            qos: 2,
            minQos: 2,
            throttleMS: 100,
            topicTransform: (reqTopic: string[]) => {
                const requester = reqTopic[reqTopic.length - 2];
                let prefix = "cmdRes";
                if (this._config.result != undefined) {
                    prefix = this._config.result.topicPrefix ?? prefix;
                }
                return [
                    prefix,
                    requester,
                    this._mqtt.clientId,
                    this._config.name,
                ];
            },
        };
    }
    static transformTypeName(address: tS7Address): TypeName {
        let typeName: TypeName;
        if (address.type === "BIT") {
            typeName = "UINT8";
        } else {
            return address.type;
        }
        if (address.count != undefined && address.count > 1) {
            typeName = `ARRAY_OF_${typeName}`;
        }

        return typeName;
    }

    private _config: tS7CommandConfig;
    private _s7ep: S7Endpoint;
    private _mqtt: Client;

    private _s7event?: S7Event;
    private _cmdPattern: TypeName[] = [];
    private _requiredParamCount: number;
    private _responseTimeoutMS = 3000;

    constructor(
        config: tS7CommandConfig,
        s7endpoint: S7Endpoint,
        @MqttConnection() mqtt: Client
    ) {
        super();
        this._config = S7CommandConfig.check(config);
        this._s7ep = s7endpoint;
        this._mqtt = mqtt;
        this._cmdPattern.push("UINT16");
        for (
            let i = 0;
            this._config.params != undefined && i < this._config.params.length;
            i++
        ) {
            const param = this._config.params[i];
            this._cmdPattern.push(
                S7Command.transformTypeName(parseS7AddressString(param))
            );
        }
        this._requiredParamCount =
            this._config.params == undefined
                ? 0
                : this._config.requiredParamCount ?? this._config.params.length;
        this._requiredParamCount++;
        if (this._config.result != undefined) {
            this._config.result.params = this._config.result.params ?? [];
            this._config.result.params = [
                this._config.result.okFlagAddress,
                ...this._config.result.params,
            ];
            this._s7event = new S7Event(this._config.result, this._s7ep);
            this._s7event.on("trigger", this.onEventTrigger.bind(this));
            this._responseTimeoutMS = this._config.result.timeoutMS;
        }
    }

    private createWriteRequest(
        cmdIdVal: tJsVal,
        paramValues: tJsVal[]
    ): WriteRequest {
        const writeTags: tS7Variable[] = [];
        if (this._config.cmdIdAddress != undefined) {
            writeTags[0] = {
                ...parseS7AddressString(this._config.cmdIdAddress),
                value: cmdIdVal,
            };
            this._cmdPattern.push(S7Command.transformTypeName(writeTags[0]));
        }
        for (let i = 0; i < paramValues.length; i++) {
            const param = this._config.params![i];
            this._cmdPattern.push(
                S7Command.transformTypeName(parseS7AddressString(param))
            );
            writeTags.push({
                ...parseS7AddressString(param),
                value: paramValues[i],
            });
        }
        return this._s7ep.createWriteRequest(writeTags);
    }

    @MqttCmdHandler(S7Command.mqttCmdConfig)
    private onMessage(req: Message, res: Message) {
        const msgParams = req.readCommand(this._cmdPattern);
        if (msgParams.length >= this._requiredParamCount) {
            const [cmdId, ...params] = msgParams;
            this.processCmd(cmdId, params, res).catch((e) => {
                //TODO debug
            });
        } else {
            //TODO debug
        }
    }

    private async processCmd(cmdId: tJsVal, params: tJsVal[], res: Message) {
        async function sendStdRes(okFlag: 1 | 0) {
            res.writeJSON([cmdId, okFlag]);
            try {
                await res.send();
            } catch (e) {
                //TODO debug
            }
        }
        try {
            const writeReq = this.createWriteRequest(cmdId, params);
            await writeReq.execute();
            if (this._config.result) {
                const [okFlag, ...eventParams] = await this.waitForCmdId(
                    cmdId as number
                );
                res.writeJSON([cmdId, okFlag, ...eventParams]);
                await res.send();
            } else {
                await sendStdRes(1);
            }
        } catch (e) {
            await sendStdRes(0);
        }
    }

    private async waitForCmdId(expectedCmdId: number): Promise<tJsVal[]> {
        return new Promise((resolve, reject) => {
            const timeOut = setTimeout(() => {
                clear();
                reject("Timeout occurred in command");
            }, this._responseTimeoutMS);

            once(this, `${expectedCmdId}`)
                .then(([params]) => {
                    const paramVals = (params as tS7Variable[]).map(
                        (p) => p.value
                    ) as tJsVal[];
                    resolve(paramVals);
                })
                .catch(() => {
                    reject();
                })
                .finally(() => {
                    clear();
                });

            const clear = () => {
                clearTimeout(timeOut);
            };
        });
    }

    private onEventTrigger(newTrigger: tS7Variable, params: tS7Variable[]) {
        this.emit(`${newTrigger.value}`, params);
    }
}
