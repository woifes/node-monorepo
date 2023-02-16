// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tAlarmJsonObject } from "@woifes/alarmhandler";
import { AlarmHandlerMqtt } from "@woifes/alarmhandlermqtt";
import { Client } from "@woifes/mqtt-client";
import {
    parseS7AddressString,
    S7Endpoint,
    stringifyS7Address,
    tS7Address,
    tS7AddressString,
    tS7Variable,
} from "@woifes/s7endpoint";
import { Debugger } from "debug";
import { once } from "events";
import * as rt from "runtypes";
import { S7Output } from "../outputs/S7Output";
import { S7AlarmAddress, tS7AlarmAddress } from "./S7AlarmAddress";
import {
    S7AlarmHandlerConfig,
    tS7AlarmHandlerConfig,
} from "./S7AlarmHandlerConfig";

type S7Alarm = {
    signalIndex: number;
    ackIn?: tS7Address;
    ackOut?: number;
    params?: number[];
    invertSignal: boolean;
};

type DiscreteAlarmAddresses = {
    signal: tS7Address;
    ackIn?: tS7Address;
    ackOut?: tS7Address;
    params?: tS7Address[];
    invertSignal?: boolean;
};

export class S7AlarmHandler {
    private static incBitAddress(addr: tS7Address) {
        const newAddr = { ...addr };
        if (newAddr.bitIndex == undefined) {
            throw new Error("No bitIndex defined on new address");
        }
        newAddr.bitIndex++;
        if (newAddr.bitIndex > 7) {
            newAddr.bitIndex = 0;
            newAddr.byteIndex++;
        }
        return newAddr;
    }
    private static alarmBulkToArray(
        bulk: tS7AlarmAddress,
        count: number
    ): DiscreteAlarmAddresses[] {
        const addrArr: DiscreteAlarmAddresses[] = [];
        let signal = { ...parseS7AddressString(bulk.signal) };
        let ackOut =
            bulk.ackOut != undefined
                ? { ...parseS7AddressString(bulk.ackOut) }
                : undefined;
        let ackIn =
            bulk.ackIn != undefined
                ? { ...parseS7AddressString(bulk.ackIn) }
                : undefined;
        for (let i = 0; i < count; i++) {
            const addr: DiscreteAlarmAddresses = {
                signal,
                ackOut,
                ackIn,
            };
            addrArr.push(addr);
            signal = this.incBitAddress(signal);
            if (ackOut != undefined) {
                ackOut = this.incBitAddress(ackOut);
            }
            if (ackIn != undefined) {
                ackIn = this.incBitAddress(ackIn);
            }
        }
        return addrArr;
    }

    private _debug: Debugger;
    private _config: tS7AlarmHandlerConfig;
    private _s7out: S7Output;
    private _s7ep: S7Endpoint;
    private _mqtt: Client;
    private _alarmHandlerMqtt: AlarmHandlerMqtt;

    private _s7Alarms: Map<number, S7Alarm> = new Map(); //Alarm nr, Alarm object
    private _outputTagsList: tS7AddressString[] = []; //Order: First Signal Bits, Then Ack Out Bits, Params

    constructor(
        config: tS7AlarmHandlerConfig,
        s7endpoint: S7Endpoint,
        mqtt: Client,
        parentDebugger: Debugger
    ) {
        this._config = S7AlarmHandlerConfig.check(config);
        this._debug = parentDebugger?.extend("alarmHandler");
        this._s7ep = s7endpoint;
        this._mqtt = mqtt;
        let discreteAlarms: DiscreteAlarmAddresses[] = [];
        if (rt.Array(S7AlarmAddress).guard(this._config.alarms)) {
            for (const alarmAddress of this._config.alarms) {
                const discreteAlarm: DiscreteAlarmAddresses = {
                    signal: parseS7AddressString(alarmAddress.signal),
                    invertSignal: alarmAddress.invertSignal,
                };
                if (alarmAddress.ackIn != undefined) {
                    discreteAlarm.ackIn = parseS7AddressString(
                        alarmAddress.ackIn
                    );
                }
                if (alarmAddress.ackOut != undefined) {
                    discreteAlarm.ackOut = parseS7AddressString(
                        alarmAddress.ackOut
                    );
                }
                if (alarmAddress.parameter != undefined) {
                    discreteAlarm.params = [];
                    for (const param of alarmAddress.parameter) {
                        discreteAlarm.params.push(parseS7AddressString(param));
                    }
                }

                discreteAlarms.push(discreteAlarm);
            }
        } else {
            discreteAlarms = S7AlarmHandler.alarmBulkToArray(
                this._config.alarms,
                this._config.numOfAlarms
            );
        }
        this.setupAlarmTags(discreteAlarms);

        this._alarmHandlerMqtt = new AlarmHandlerMqtt(this._config, this._mqtt);

        this._s7out = new S7Output(
            {
                tags: this.outTagObject,
                pollIntervalMS:
                    this._alarmHandlerMqtt.presentAlarmWatchdogTimeS * 500, //half of the time the watchdog needs
            },
            this._s7ep,
            this._debug
        );

        this.initializeAllAckIn().finally(() => {
            this._s7out.on("data", this.onOutput.bind(this));
            this._alarmHandlerMqtt.on("ack", this.onAck.bind(this) as any);
            this._alarmHandlerMqtt.on("gone", this.onGone.bind(this) as any);
        });
    }

    get alarmHandlerMqtt(): AlarmHandlerMqtt {
        return this._alarmHandlerMqtt;
    }

    async stopPolling() {
        this._s7out.stopPolling();
        await once(this._s7out, "pollingStopped");
    }

    private setupAlarmTags(discreteAlarms: DiscreteAlarmAddresses[]) {
        let alarmNr = 1;
        const pushTagToList = (tag: tS7AddressString): number => {
            return this._outputTagsList.push(tag) - 1;
        };

        for (const discreteAlarm of discreteAlarms) {
            const s7Alarm: S7Alarm = {
                signalIndex: pushTagToList(
                    stringifyS7Address(discreteAlarm.signal)
                ),
                invertSignal: discreteAlarm.invertSignal ?? false,
            };
            if (discreteAlarm.params != undefined) {
                s7Alarm.params = [];
                for (const param of discreteAlarm.params) {
                    s7Alarm.params.push(
                        pushTagToList(stringifyS7Address(param))
                    );
                }
            }
            if (discreteAlarm.ackOut != undefined) {
                s7Alarm.ackOut = pushTagToList(
                    stringifyS7Address(discreteAlarm.ackOut)
                );
            }
            if (discreteAlarm.ackIn != undefined) {
                s7Alarm.ackIn = { ...discreteAlarm.ackIn };
            }

            this._s7Alarms.set(alarmNr, s7Alarm);
            alarmNr++;
        }
        this._debug("Finished setupAlarmTags()");
    }

    /**
     * Returns the list of signals bits, acknowledgment bits and parameters (from plc) as array
     * @returns
     */
    private get outTagObject(): { [key: string]: tS7AddressString } {
        const outTagObject: { [key: string]: tS7AddressString } = {};
        let i = 0;
        for (const tag of this._outputTagsList) {
            outTagObject[`${++i}`] = tag as tS7AddressString;
        }
        return outTagObject;
    }

    /**
     * @param tags
     */
    private onOutput(tags: tS7Variable[]) {
        this._debug(`onOutput`);
        for (let i = 1; i <= this._config.numOfAlarms; i++) {
            const s7Alarm = this._s7Alarms.get(i)!;
            let signalValue =
                (tags[s7Alarm.signalIndex].value as number) > 0 ? true : false;
            if (s7Alarm.invertSignal) {
                signalValue = !signalValue;
            }
            const paramValues: any[] = [];
            if (s7Alarm.params != undefined) {
                for (const paramIndex of s7Alarm.params) {
                    paramValues.push(tags[paramIndex].value);
                }
            }
            this._alarmHandlerMqtt.updateSignal(i, signalValue, ...paramValues);

            if (s7Alarm.ackOut != undefined) {
                const ackOutVal =
                    (tags[s7Alarm.ackOut].value as number) > 0 ? true : false;
                if (ackOutVal) {
                    this._alarmHandlerMqtt.acknowledgeAlarm(i);
                }
            }
        }
        this._alarmHandlerMqtt.getPresentAlarms(); //triggers the event and so forth
    }

    private async initializeAllAckIn() {
        const presentAlarms = this._alarmHandlerMqtt.getPresentAlarms();
        const tags: tS7Variable[] = [];
        for (const [alarmNr, s7Alarm] of this._s7Alarms) {
            const ackIn = s7Alarm.ackIn;
            if (ackIn != undefined) {
                let value = 0;
                if (
                    presentAlarms.alarms[alarmNr] != undefined &&
                    presentAlarms.alarms[alarmNr].ackTime != undefined
                ) {
                    value = 1;
                }
                tags.push({
                    value,
                    ...ackIn,
                });
            }
        }
        if (tags.length > 0) {
            this._debug(`Set ${tags.length} ackIn`);
            if (!this._s7ep.connected) {
                await once(this._s7ep, "connect");
            }
            const writeReq = this._s7ep.createWriteRequest(tags);
            await writeReq.execute();
        }
    }

    private onAck(alarmNr: number, alarm: tAlarmJsonObject) {
        this.setAckIn(alarmNr, true).catch(() => {
            this._debug("Error in onAck()");
        });
    }

    private onGone(alarmNr: number, alarm: tAlarmJsonObject) {
        this.setAckIn(alarmNr, false).catch(() => {
            this._debug("Error in onGone()");
        });
    }

    private async setAckIn(alarmNr: number, value: boolean) {
        const ackTag = this._s7Alarms.get(alarmNr)?.ackIn;
        if (ackTag != undefined) {
            const ackVar: tS7Variable = { ...ackTag, value: value ? 1 : 0 };
            const writeReq = this._s7ep.createWriteRequest([ackVar]);
            return writeReq.execute();
        }
        return Promise.resolve();
    }
}
