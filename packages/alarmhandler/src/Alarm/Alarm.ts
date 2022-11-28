// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { EventEmitter } from "events";
import { tAlarmDefinition } from "./AlarmDefinition";
import { AlarmJsonObject, tAlarmJsonObject } from "./AlarmJsonObject";

/**
 * Position of Signal bit in bitmask
 */
export const SIGNAL_BIT_POS = 0x1;
/**
 * Position of triggered bit in bitmask
 */
export const TRIGGERED_BIT_POS = 0x2;
/**
 * Position of acknowledged bit in bitmask
 */
export const ACKNOWLEDGED_BIT_POS = 0x4;

export declare interface Alarm {
    /**
     * emitted one time when the alarm is triggered emits the json object
     */
    on(event: "new", listener: (alarm: tAlarmJsonObject) => void): this;
    /**
     * emitted when the alarm was untriggered (either by ack bit or by autoAck) emits a trace string in csv format
     */
    on(event: "gone", listener: (trace: string) => void): this;
    /**
     * emitted when the alarm is acknowledged emits the json object
     */
    on(event: "ack", listener: (alarm: tAlarmJsonObject) => void): this;
    /**
     * emitted when the signal changes (both edges) emits the json object
     */
    on(
        event: "signalChanged",
        listener: (alarm: tAlarmJsonObject) => void
    ): this;
}

export class Alarm extends EventEmitter {
    private _bitMask = 0;
    private _autoAck: boolean;
    private _category: string;
    private _categoryNum: number;
    private _text: string;
    private _nr: number;

    private _occured?: Date;
    private _ackTime?: Date;
    private _params: (number | string)[] = [];

    /**
     * Represents a single alarm. Set the signal to true and the alarm will be considered as "triggered".
     * Setting the signal to false will only untrigger the alarm if "autoAck is set". If no autoAck is set,
     * the alarm has to be acknowledged with the "ack" bit. The alarm saves the occurance and acknowledge time
     * Generally the state of the alarm should be checked by the "toJSON()" method, which will return a standardised
     * Alarm object.
     * There are multiple event to register to:
     * * ```new``` emitted one time when the alarm is triggered emits the json object
     * * ```gone``` emitted when the alarm was untriggered (either by ack bit or by autoAck) emits a trace string in csv format
     * * ```ack``` emitted when the alarm is acknowledged emits the json object
     * * ```signalChanged``` emitted when the signal changes (both edges) emits the json object
     * @param nr the nr (id) of the alarm
     * @param def the alarm definiton for the alarm
     * @param presentAlarmInfo if the alarm stat was saved persistant it can be given here to restore the state
     */
    constructor(
        nr: number,
        def: tAlarmDefinition,
        presentAlarmInfo?: tAlarmJsonObject
    ) {
        super();
        this._autoAck = def.autoAck;
        this._category = def.c;
        this._categoryNum = def.cn;
        this._text = def.text;
        this._nr = nr;
        if (presentAlarmInfo != undefined) {
            this.fromJSON(presentAlarmInfo);
        }
    }

    get signal(): boolean {
        return (this._bitMask & SIGNAL_BIT_POS) > 0;
    }
    setSignal(bit: boolean, ...params: (number | string)[]) {
        const sigOld = this.signal;
        if (bit) {
            this._bitMask |= SIGNAL_BIT_POS;
            if (params.length > 0) {
                this._params = params;
            }
            this.setTriggered(true);
        } else {
            this._bitMask &= 0xff ^ SIGNAL_BIT_POS;
            if (this._autoAck || this.ack) {
                this.setTriggered(false);
            }
        }
        if (sigOld != bit) {
            this.emit("signalChanged", this.toJSON());
        }
    }

    get triggered(): boolean {
        return (this._bitMask & TRIGGERED_BIT_POS) > 0;
    }
    private setTriggered(bit: boolean) {
        const trgOld = this.triggered;
        if (bit) {
            this._bitMask |= TRIGGERED_BIT_POS;
            if (!trgOld) {
                this._occured = new Date();
                this.emit("new", this.toJSON());
            }
        } else {
            this._bitMask &= 0xff ^ TRIGGERED_BIT_POS;
            if (trgOld) {
                const trace = this.traceString();
                this.reset();
                this.emit("gone", trace);
            }
        }
    }

    get ack(): boolean {
        return (this._bitMask & ACKNOWLEDGED_BIT_POS) > 0;
    }
    set ack(bit: boolean) {
        if (bit && this.triggered && !this.ack) {
            this._bitMask |= ACKNOWLEDGED_BIT_POS;
            this._ackTime = new Date();
            this.emit("ack", this.toJSON());
            this.setSignal(this.signal); //retrigger signal check here
        }
    }

    get autoAck(): boolean {
        return this._autoAck;
    }
    set autoAck(bit: boolean) {
        this._autoAck = bit;
    }

    /**
     * Returns the alarm text with parameter replaced
     */
    get text(): string {
        return this._text.replaceAll(
            /\$\d+/g,
            (match: string, ..._args: any[]) => {
                const n = parseInt(match.slice(1));
                if (Number.isFinite(n) && this._params[n - 1] != undefined) {
                    return String(this._params[n - 1]);
                } else {
                    return match;
                }
            }
        );
    }

    /**
     * Sets the text of the alarm.
     * Use $n (1 - x) to include parameter from the signal
     */
    set text(newText: string) {
        this._text = newText;
    }

    private traceString() {
        //["alarmNum", "occured", "disappeared", "acknowledged", "autoAck", "category", "categoryNum", "text"]
        let str = `${this._nr};`; //alarmNum
        str += `${this._occured!.toJSON()};`; //occured
        str += `${new Date().toJSON()};`; //disappeared
        str += `${this._ackTime != undefined ? this._ackTime.toJSON() : ""};`; //acknowledged
        str += `${this.autoAck ? 1 : 0};`; //autoAck
        str += `${this._category};`; //category
        str += `${this._categoryNum};`; //categoryNum
        str += `${this.text}`; //text

        return str;
    }

    private reset() {
        this._bitMask = 0;
        delete this._occured;
        delete this._ackTime;
        this._params = [];
    }

    toJSON(): tAlarmJsonObject {
        const obj: tAlarmJsonObject = {
            category: this._category,
            categoryNum: this._categoryNum,
            text: this.text,
        };
        if (this._occured != undefined) {
            obj.occured = this._occured.toJSON();
        }
        if (this._ackTime != undefined) {
            obj.ackTime = this._ackTime.toJSON();
        }
        return obj;
    }

    private fromJSON(obj: any) {
        try {
            obj = AlarmJsonObject.check(obj);
            const isOccured =
                obj.occured != undefined &&
                Number.isFinite(Date.parse(obj.occured));
            const isAck =
                obj.ackTime != undefined &&
                Number.isFinite(Date.parse(obj.ackTime));
            if (isOccured) {
                this._occured = new Date(obj.occured!);
                this._bitMask |= TRIGGERED_BIT_POS;

                if (isAck) {
                    this._ackTime = new Date(obj.ackTime!);
                    this._bitMask |= ACKNOWLEDGED_BIT_POS;
                    this._bitMask |= SIGNAL_BIT_POS;
                }
            }
        } catch {
            //TODO debug
        }
    }
}
