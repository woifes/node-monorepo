// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { EventEmitter } from "events";
import { basename, dirname } from "path";
import { CsvFileHandler, PersistentRuntype } from "@woifes/util";
import { Alarm } from "./Alarm/Alarm";
import { tAlarmDefinition } from "./Alarm/AlarmDefinition";
import { tAlarmJsonObject } from "./Alarm/AlarmJsonObject";
import { AlarmDefsInfo, tAlarmDefsInfo } from "./runtypes/AlarmDefsInfo";
import {
    AlarmHandlerConfig,
    tAlarmHandlerConfig,
} from "./runtypes/AlarmHandlerConfig";
import {
    PresentAlarmsInfo,
    tPresentAlarmsInfo,
} from "./runtypes/PresentAlarmsInfo";

export declare interface AlarmHandler {
    /**
     * Emitted when one alarm occurs emits the alarm number and the alarm json representation
     */
    on(
        event: "new",
        listener: (alarmNr: number, alarm: tAlarmJsonObject) => void,
    ): this;
    /**
     * Emitted when one alarm is reset emits the alarm number and the tracestring
     */
    on(event: "gone", listener: (alarmNr: number, trace: string) => void): this;
    /**
     * Emitted when one alarm is acknowledged emits the alarm number and the json representation
     */
    on(
        event: "ack",
        listener: (alarmNr: number, alarm: tAlarmJsonObject) => void,
    ): this;
    /**
     * Emitted when one alarm changes its signal emit the alarm number and the json representation
     */
    on(
        event: "signalChanged",
        listener: (alarmNr: number, alarm: tAlarmJsonObject) => void,
    ): this;
    /**
     * Emitted when the overall present alarm info changes (combination of the other events). Emits the new alarm representation
     */
    on(
        event: "presentAlarmsChanged",
        listener: (alarmInfo: tPresentAlarmsInfo) => void,
    ): this;
    /**
     * Emitted when one of the alarm texts did change
     */
    on(
        event: "alarmTextChanged",
        listener: (alarmNr: number, oldText: string, newText: string) => void,
    ): this;
}

export class AlarmHandler extends EventEmitter {
    static csvHeader(): string[] {
        return [
            "alarmNum",
            "occurred",
            "disappeared",
            "acknowledged",
            "autoAck",
            "category",
            "categoryNum",
            "text",
        ];
    }
    static standardAlarmDef(): tAlarmDefinition {
        return { autoAck: false, c: "default", cn: 0, text: "No text" };
    }

    protected _config: tAlarmHandlerConfig;
    protected _name: string;

    protected _alarmDefs: PersistentRuntype<tAlarmDefsInfo>;
    protected _presentAlarms: PersistentRuntype<tPresentAlarmsInfo>;
    protected _alarmTrace: CsvFileHandler;

    [key: number]: Alarm; //Arraylike
    protected length = 0; //Arraylike

    /**
     * The alarmhandler handles multiple alarm objects. It is array like which means that array functions can be called on it.
     * The array like behavior is that at position 0 there is no item the other positions are occupied by alarms with the corresponding number
     * There are also shorthand methods for the different alarm functions
     * Events:
     * * ```new``` emitted when one alarm occurs emits the alarm number and the alarm json representation
     * * ```gone``` emitted when one alarm is reset emits the alarm number and the tracestring
     * * ```ack``` emitted when one alarm is acknowledged emits the alarm number and the json representation
     * * ```signalChanged``` emitted when one alarm changes its signal emit the alarm number and the json representation
     * * ```presentAlarmsChanged``` emitted when the overall present alarm info changes (combination of the above events). Emits the new alarm representation
     * @param name the name (id) of the alarm handler
     * @param config config (see the type definition doc)
     * @param alarmDefs optional external alarm definitions
     */
    constructor(
        name: string,
        config: tAlarmHandlerConfig,
        alarmDefs?: PersistentRuntype<tAlarmDefsInfo>,
    ) {
        super();
        this._config = AlarmHandlerConfig.check(config);
        this.length = this._config.numOfAlarms + 1; //zero based with empty item at position 0
        this._name = name;

        if (alarmDefs !== undefined) {
            this._alarmDefs = alarmDefs;
            let definitions = this._alarmDefs.getValue();
            definitions = this.fillAlarmDefinitons(definitions);
            this._alarmDefs.setValue(definitions);
        } else if (this._config.alarmDefsPath !== undefined) {
            const defaultDefs = this.fillAlarmDefinitons();
            this._alarmDefs = new PersistentRuntype(
                this._config.alarmDefsPath,
                AlarmDefsInfo,
                defaultDefs,
            );
        } else {
            throw new Error("No alarm definitions found");
        }

        this._presentAlarms = new PersistentRuntype(
            this._config.presentAlarmsFilePath,
            PresentAlarmsInfo,
            { time: new Date().toJSON(), alarms: [] },
            { noMergeAtSet: true },
        );
        const presentAlarmsObj = this._presentAlarms.getValue().alarms;
        const presentAlarmsByNumber: tAlarmJsonObject[] = [];
        for (const alNr in presentAlarmsObj) {
            presentAlarmsByNumber[alNr] = presentAlarmsObj[alNr];
        }

        const alarmDefinitions = this._alarmDefs.getValue();
        for (let i = 1; i <= this._config.numOfAlarms; i++) {
            const alarm = new Alarm(
                i,
                alarmDefinitions[i],
                presentAlarmsByNumber[i],
            );
            alarm.on("new", (obj: tAlarmJsonObject) => {
                this.emit("new", i, obj);
                this.getPresentAlarms();
            });
            alarm.on("gone", (logLine: string) => {
                this.emit("gone", i, logLine);
                this.getPresentAlarms();
                this._alarmTrace.writeLine(logLine);
            });
            alarm.on("ack", (obj: tAlarmJsonObject) => {
                this.emit("ack", i, obj);
                this.getPresentAlarms();
            });
            alarm.on("signalChanged", (obj: tAlarmJsonObject) => {
                this.emit("signalChanged", i, obj);
                this.getPresentAlarms();
            });
            alarm.on("alarmTextChanged", (oldText: string, newText: string) => {
                this.emit("alarmTextChanged", i, oldText, newText);
                this.onAlarmTextChanged(i, oldText, newText);
            });
            this[i] = alarm;
        }

        this._alarmTrace = new CsvFileHandler(
            basename(this._config.traceFilePath),
            dirname(this._config.traceFilePath),
            {
                maxFileSizeMB: 10,
                header: AlarmHandler.csvHeader(),
                addTimeStamp: false,
            },
        );

        this.getPresentAlarms();
    }

    /**
     * Number of alarms this AlarmHandler tracks
     */
    get numOfAlarms(): number {
        return this._config.numOfAlarms;
    }

    /**
     * The name (id) of this Alarm Handler
     */
    get name(): string {
        return this._name;
    }

    /**
     * Fills a existing set of alarm definitions, or creates one
     * @param existingDef an (incomplete) existing alarm defintion info obj
     * @returns the filled up (complete) alarm definition info obj
     */
    private fillAlarmDefinitons(
        existingDef: tAlarmDefsInfo = {},
    ): tAlarmDefsInfo {
        for (let i = 1; i <= this._config.numOfAlarms; i++) {
            const definition = existingDef[i];
            if (definition === undefined) {
                existingDef[i] = AlarmHandler.standardAlarmDef();
            }
        }
        return existingDef;
    }

    /**
     * Updates the signal of a certain alarm
     * @param nr the alarm number to update
     * @param sig the new signal value
     * @param params undefined number of parameters
     */
    updateSignal(nr: number, sig: boolean, ...params: (number | string)[]) {
        if (this[nr] !== undefined) {
            this[nr].setSignal(sig, ...params);
            return true;
        }
        return false;
    }

    /**
     * Tries to acknowledge a certain alarm
     * @param nr the number of the alarm to acknowledge. If "0" is provided, all alarms will be acknowledged
     * @returns true if ack was set, false otherwise
     */
    acknowledgeAlarm(nr: number) {
        if (nr === 0) {
            for (let i = 1; i < this.length; i++) {
                this[i].ack = true;
            }
            return true;
        } else if (this[nr] !== undefined) {
            this[nr].ack = true;
            return true;
        }
        return false;
    }

    /**
     * Sets the alarm text for the given alarm number
     * @param nr the alarm number (id)
     * @param text the new text
     * @returns true or false depending if it was successfull
     */
    setAlarmText(nr: number, text: string) {
        if (this[nr] !== undefined) {
            this[nr].text = text;
            return true;
        }
        return false;
    }

    /**
     * Returns the current present alarms
     * @returns
     */
    getPresentAlarms(): tPresentAlarmsInfo {
        const presentAlarmsInfo: tPresentAlarmsInfo = {
            time: new Date().toJSON(),
            alarms: {},
        };
        for (let i = 1; i < this.length; i++) {
            const alarmInfo = this[i].toJSON();
            if (alarmInfo.occurred !== undefined) {
                presentAlarmsInfo.alarms[i] = alarmInfo;
            }
        }
        this._presentAlarms.setValue(presentAlarmsInfo);
        this.emit("presentAlarmsChanged", { ...presentAlarmsInfo });
        return presentAlarmsInfo;
    }

    private onAlarmTextChanged(
        alarmNr: number,
        oldText: string,
        newText: string,
    ) {
        const definitions = this._alarmDefs.getValue();
        definitions[alarmNr].text = newText;
        this._alarmDefs.setValue(definitions);
    }
}
