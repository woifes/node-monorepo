// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client } from "@woifes/mqtt-client";
import {
    dbSourceToS7Variables,
    parseS7AddressString,
    S7Endpoint,
    S7LocalEndpoint,
    S7RemoteEndpoint,
    S7RemoteEndpointConfig,
    tDbDefinition,
    tS7LocalEndpointConfig,
    tS7Variable,
} from "@woifes/s7endpoint";
import { PickRequire } from "@woifes/util";
import debug, { Debugger } from "debug";
import { readFileSync } from "fs-extra";
import { S7AlarmHandler, tS7AlarmHandlerConfig } from "./alarms";
import { S7Command, tS7CommandConfig } from "./commands";
import { S7EventMqtt, tS7EventMqttConfig } from "./events";
import { MqttInput, tMqttInputConfig } from "./inputs";
import { S7OutputMqtt, tS7OutputConfig } from "./outputs";
import { S7MqttConfig, tS7MqttConfig } from "./runtypes/S7MqttConfig";

type tNamedS7Variable = PickRequire<tS7Variable, "name">;

export class S7Mqtt {
    private _s7ep: S7Endpoint;
    private _mqtt: Client;
    private _debug: Debugger;

    private _config: tS7MqttConfig;

    private _alarms?: S7AlarmHandler;
    private _commands: S7Command[] = [];
    private _events: S7EventMqtt[] = [];
    private _inputs: MqttInput[] = [];
    private _outputs: S7OutputMqtt[] = [];

    constructor(config: tS7MqttConfig) {
        this._config = S7MqttConfig.check(config);
        if (S7RemoteEndpointConfig.guard(this._config.endpoint)) {
            this._s7ep = new S7RemoteEndpoint(this._config.endpoint);
        } else {
            this._s7ep = this.setupLocalEndpoint(
                this._config.endpoint,
                this._config
            );
        }
        this._debug = debug(`${this._config.mqtt.clientId}`);
        this._s7ep.connect();
        this._mqtt = new Client(this._config.mqtt);

        if (this._config.alarms != undefined) {
            this._alarms = new S7AlarmHandler(
                this._config.alarms,
                this._s7ep,
                this._mqtt,
                this._debug
            );
        }

        if (this._config.commands != undefined) {
            for (const cmd of this._config.commands) {
                this._commands.push(
                    new S7Command(cmd, this._s7ep, this._mqtt, this._debug)
                );
            }
        }

        if (this._config.events != undefined) {
            for (const evt of this._config.events) {
                this._events.push(
                    new S7EventMqtt(evt, this._s7ep, this._mqtt, this._debug)
                );
            }
        }

        if (this._config.inputs != undefined) {
            for (const inp of this._config.inputs) {
                this._inputs.push(
                    new MqttInput(inp, this._s7ep, this._mqtt, this._debug)
                );
            }
        }

        if (this._config.outputs != undefined) {
            for (const outp of this._config.outputs) {
                this._outputs.push(
                    new S7OutputMqtt(outp, this._s7ep, this._mqtt, this._debug)
                );
            }
        }
    }

    stop() {
        this._s7ep.stop();
    }

    private setupLocalEndpoint(
        epConfig: Omit<tS7LocalEndpointConfig, "datablocks">,
        config: tS7MqttConfig
    ): S7Endpoint {
        let v: tNamedS7Variable[] = [];
        if (config.alarms != undefined) {
            v = [...v, ...this.getAlarmDbVariables(config.alarms)];
        }
        if (this._config.commands != undefined) {
            for (const cmd of this._config.commands) {
                v = [...v, ...this.getCommandDbVariables(cmd)];
            }
        }
        if (this._config.events != undefined) {
            let i = 1;
            for (const evt of this._config.events) {
                v = [...v, ...this.getEventDbVariables(i++, evt)];
            }
        }
        if (this._config.inputs != undefined) {
            let i = 1;
            for (const inp of this._config.inputs) {
                v = [...v, ...this.getInputDbVariables(i++, inp)];
            }
        }
        if (this._config.outputs != undefined) {
            for (const outp of this._config.outputs) {
                v = [...v, ...this.getOutputDbVariables(outp)];
            }
        }
        //sort by db
        const datablocks: { [nr: number]: tDbDefinition } = {};
        for (const variable of v) {
            if (datablocks[variable.dbNr!] == undefined) {
                datablocks[variable.dbNr!] = { vars: [] };
            }
            (datablocks[variable.dbNr!].vars as any[]).push(variable);
        }

        return new S7LocalEndpoint({ ...epConfig, datablocks });
    }

    private getAlarmDbVariables(
        config: tS7AlarmHandlerConfig
    ): tNamedS7Variable[] {
        const addresses: tNamedS7Variable[] = [];
        const alarms = config.alarms;
        if (Array.isArray(alarms)) {
            let i = 1;
            for (const alarm of alarms) {
                addresses.push({
                    name: `alarm${i}_sig`,
                    ...parseS7AddressString(alarm.signal),
                });
                if (alarm.parameter != undefined) {
                    let j = 1;
                    for (const parameter of alarm.parameter) {
                        addresses.push({
                            name: `al${i}_p${j++}`,
                            ...parseS7AddressString(parameter),
                        });
                        j++;
                    }
                }
                if (alarm.ackIn != undefined) {
                    addresses.push({
                        name: `alarm${i}_ackIn`,
                        ...parseS7AddressString(alarm.ackIn),
                    });
                }
                if (alarm.ackOut != undefined) {
                    addresses.push({
                        name: `alarm${i}_ackOut`,
                        ...parseS7AddressString(alarm.ackOut),
                    });
                }
                i++;
            }
        } else {
            addresses.push({
                name: `alarmSignalBulk`,
                ...parseS7AddressString(alarms.signal),
                count: config.numOfAlarms,
            });
            if (alarms.ackIn != undefined) {
                addresses.push({
                    name: `alarmAckInBulk`,
                    ...parseS7AddressString(alarms.ackIn),
                    count: config.numOfAlarms,
                });
            }
            if (alarms.ackOut != undefined) {
                addresses.push({
                    name: `alarmAckInBulk`,
                    ...parseS7AddressString(alarms.ackOut),
                    count: config.numOfAlarms,
                });
            }
        }
        return addresses;
    }

    private getCommandDbVariables(
        config: tS7CommandConfig
    ): tNamedS7Variable[] {
        const addresses: tNamedS7Variable[] = [];
        const identifier = `Cmd_${config.name}`;
        if (config.cmdIdAddress != undefined) {
            addresses.push({
                name: `${identifier}_cmdId`,
                ...parseS7AddressString(config.cmdIdAddress),
            });
        }
        if (config.params != undefined) {
            let i = 1;
            for (const param of config.params) {
                addresses.push({
                    name: `${identifier}_param${i++}`,
                    ...parseS7AddressString(param),
                });
            }
        }
        if (config.result != undefined) {
            addresses.push({
                name: `${identifier}_resTrigger`,
                ...parseS7AddressString(config.result.trigger),
            });
            if (config.result.params != undefined) {
                let i = 1;
                for (const param of config.result.params) {
                    addresses.push({
                        name: `${identifier}_resParam${i++}`,
                        ...parseS7AddressString(param),
                    });
                }
            }
            if (config.result.okFlagAddress != undefined) {
                addresses.push({
                    name: `${identifier}_okFlag`,
                    ...parseS7AddressString(config.result.okFlagAddress),
                });
            }
        }
        return addresses;
    }

    private getEventDbVariables(
        id: number,
        config: tS7EventMqttConfig
    ): tNamedS7Variable[] {
        const addresses: tNamedS7Variable[] = [];
        const identifier = `Evt_${id}`;
        addresses.push({
            name: `${identifier}_trigger`,
            ...parseS7AddressString(config.trigger),
        });
        if (config.params != undefined) {
            let i = 1;
            for (const param of config.params) {
                addresses.push({
                    name: `${identifier}_param${i++}`,
                    ...parseS7AddressString(param),
                });
            }
        }
        return addresses;
    }

    private getInputDbVariables(
        id: number,
        config: tMqttInputConfig
    ): tNamedS7Variable[] {
        const addresses: tNamedS7Variable[] = [];
        if (Array.isArray(config.target)) {
            let i = 1;
            for (const t of config.target) {
                addresses.push({ name: `input_${id}_${i++}`, ...t });
            }
        } else {
            addresses.push({ name: `input_${id}`, ...config.target });
        }
        return addresses;
    }

    private getOutputDbVariables(config: tS7OutputConfig): tNamedS7Variable[] {
        let addresses: tNamedS7Variable[] = [];
        if (config.tags != undefined) {
            for (const tagName of Object.keys(config.tags)) {
                const tag = config.tags[tagName];
                addresses.push({ name: tagName, ...parseS7AddressString(tag) });
            }
        }
        if (config.datablocks != undefined) {
            for (const db of config.datablocks) {
                try {
                    //first try to parse the string
                    addresses = [
                        ...addresses,
                        ...(dbSourceToS7Variables(
                            db.filePathOrContent,
                            db.dbNr
                        ) as tNamedS7Variable[]),
                    ];
                    continue;
                } catch {
                    //second try to find the file
                    const fileContent = readFileSync(db.filePathOrContent, {
                        encoding: "utf-8",
                    });
                    addresses = [
                        ...addresses,
                        ...(dbSourceToS7Variables(
                            fileContent,
                            db.dbNr
                        ) as tNamedS7Variable[]),
                    ];
                }
            }
        }
        return addresses;
    }
}
