// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { debug, Debugger } from "debug";
import { EventEmitter } from "events";
import { readFileSync } from "fs-extra";
import { S7Server } from "node-snap7";
import * as rt from "runtypes";
import { tS7DataAreas } from "../const";
import { dbSourceToS7Variables } from "../parseDbSourceFile";
import {
    genVariableBuffer,
    getBoundsOfVarSet,
    ReadRequest,
    WriteRequest,
} from "../request";
import { S7Endpoint } from "../S7Endpoint";
import { tS7Variable } from "../types/S7Variable";
import { createDbCsvWriter } from "./createDbCsvWriter";
import { DbDefinition } from "./DbDefinition";
import { writeDbCsv } from "./writeDbCsv";

export const S7LocalEndpointConfig = rt.Record({
    name: rt.String.withConstraint(
        (s) => s.length > 0 || `name shall not be empty string`
    ),
    datablocks: rt.Dictionary(
        DbDefinition,
        rt.Number.withConstraint((n) => n > 0)
    ),
    datablockCsvDir: rt.String.withConstraint((s) => s.length > 0).optional(),
    allowArrayTypesInCsv: rt.Boolean.optional(), //only comfort panels and better can have this
});

export type tS7LocalEndpointConfig = rt.Static<typeof S7LocalEndpointConfig>;

export class S7LocalEndpoint extends EventEmitter implements S7Endpoint {
    private _server: S7Server;
    private _config: tS7LocalEndpointConfig;
    private _connected = false;
    private _reconnectTimeout?: NodeJS.Timeout;
    private _dbs: Map<number, Buffer> = new Map();
    private _debug: Debugger;
    private _debugRead: Debugger;
    private _debugWrite: Debugger;

    constructor(config: tS7LocalEndpointConfig) {
        super();
        this._config = config;
        this._server = new S7Server();
        this._debug = debug(`S7(${this._config.name})`);
        this._debugRead = this._debug.extend("Read");
        this._debugWrite = this._debug.extend("Write");
        for (const dbNr in this._config.datablocks) {
            const db = this._config.datablocks[dbNr];
            const vars = db.vars;
            let varArr: tS7Variable[];
            if (rt.String.guard(vars)) {
                varArr = dbSourceToS7Variables(readFileSync(vars, "utf-8"));
            } else {
                varArr = [...vars];
            }
            this.setupDb(parseInt(dbNr), varArr);
        }
    }

    get name(): string {
        return this._config.name;
    }

    get connected(): boolean {
        return this._connected;
    }

    private setupDb(dbNr: number, vars: tS7Variable[]) {
        const [start, end] = getBoundsOfVarSet(vars);
        const buf = Buffer.alloc(end);
        for (const variable of vars) {
            if (variable.value != undefined) {
                const varBuf = genVariableBuffer(variable);
                varBuf.copy(buf, variable.byteIndex, 0);
            }
        }
        this.registerArea(dbNr, buf);
        if (this._config.datablockCsvDir != undefined) {
            const writer = createDbCsvWriter(
                `${this._config.name}_DBs`,
                this._config.datablockCsvDir
            );
            writeDbCsv(writer, dbNr, vars);
        }
        this._debug(`Registered DB${dbNr} with length of ${end} bytes`);
    }

    private registerArea(dbNr: number, buf: Buffer) {
        this._dbs.set(dbNr, buf);
        return this._server.RegisterArea(this._server.srvAreaDB, dbNr, buf);
    }

    private lockArea(dbNr: number) {
        return this._server.LockArea(this._server.srvAreaDB, dbNr);
    }

    private unlockArea(dbNr: number) {
        return this._server.UnlockArea(this._server.srvAreaDB, dbNr);
    }

    /**
     * no locking
     * @param dbNr
     * @param buf
     * @returns
     */
    private setArea(dbNr: number, buf: Buffer) {
        this._dbs.set(dbNr, buf);
        return this._server.SetArea(this._server.srvAreaDB, dbNr, buf);
    }

    /**
     * no locking
     * @param dbNr
     * @returns
     */
    private getArea(dbNr: number) {
        const buf = this._server.GetArea(this._server.srvAreaDB, dbNr);
        this._dbs.set(dbNr, buf);
        return buf;
    }

    connect(): void {
        this._server.Start((err: any) => {
            if (err != undefined) {
                this._debug(`Error at server.Connect: ${err}`);
            } else {
                delete this._reconnectTimeout;
                this._connected = true;
                this._debug("Server successfully connected");
                this.emit("connect");
            }
        });
    }

    disconnect(): void {
        this._debug("Called disconnect()");
        this.stop();
        this._connected = false;
        this.emit("disconnect");
    }

    stop(): void {
        this._debug("Called stop()");
        this._server.Stop();
    }

    createReadRequest(tags: tS7Variable[]): ReadRequest {
        return new ReadRequest(tags, this);
    }

    createWriteRequest(tags: tS7Variable[]): WriteRequest {
        return new WriteRequest(tags, this);
    }

    readAreaBytes(
        area: tS7DataAreas,
        dbNr: number,
        dbIndex: number,
        length: number
    ): Promise<Buffer> {
        if (area != "DB") {
            throw new Error(
                "Could not read: In local endpoint only DB areas area allowed"
            );
        }
        this._debugRead(`Read DB${dbNr} from ${dbIndex} with length ${length}`);
        try {
            this.lockArea(dbNr);
            const db = this.getArea(dbNr);
            if (db.length >= dbIndex + length) {
                const dbSlice = db.slice(dbIndex, dbIndex + length);
                return Promise.resolve(dbSlice);
            } else {
                throw new Error(
                    `Db ${dbNr} has length ${db.length} but needed ${
                        dbIndex + length
                    }`
                );
            }
        } catch (e) {
            this._debugRead(`${e}`);
            return Promise.reject(e);
        } finally {
            this.unlockArea(dbNr);
        }
    }

    writeAreaBytes(
        area: tS7DataAreas,
        dbNr: number,
        dbIndex: number,
        buf: Buffer
    ): Promise<void> {
        if (area != "DB") {
            throw new Error(
                "Could not write: In local endpoint only DB areas area allowed"
            );
        }
        this._debugWrite(
            `Write DB${dbNr} from ${dbIndex} with length ${buf.length}`
        );
        try {
            this.lockArea(dbNr);
            const db = this.getArea(dbNr);
            if (db.length >= dbIndex + buf.length) {
                buf.copy(db, dbIndex, 0);
                this.setArea(dbNr, db);
                return Promise.resolve();
            } else {
                throw new Error(
                    `Db ${dbNr} has length ${db.length} but needed ${
                        dbIndex + buf.length
                    }`
                );
            }
        } catch (e) {
            this._debugWrite(`${e}`);
            return Promise.reject(e);
        } finally {
            this.unlockArea(dbNr);
        }
    }
}
