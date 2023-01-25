// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { debug, Debugger } from "debug";
import { EventEmitter } from "events";
import {
    MultiVarRead,
    MultiVarsReadResult,
    MultiVarsWriteResult,
    MultiVarWrite,
    S7Client,
} from "node-snap7";
import * as rt from "runtypes";
import { tS7DataAreas } from "../const";
import { ReadRequest, WriteRequest } from "../request";
import { S7Endpoint } from "../S7Endpoint";
import { tS7Variable } from "../types/S7Variable";

export const S7RemoteEndpointConfig = rt.Record({
    endpointIp: rt.String.withConstraint(
        (s) => s.length > 0 || `endPointIp shall not be empty string`
    ),
    rack: rt.Number.withConstraint(
        (n) => n > 0 || `rack shall be greater than 0`
    ),
    slot: rt.Number.withConstraint(
        (n) => n > 0 || `slot shall be greater than 0`
    ),
    selfRack: rt.Number.withConstraint(
        (n) => n > 0 || `selfRack shall be greater then 0`
    ),
    selfSlot: rt.Number.withConstraint(
        (n) => n > 0 || `selfSlot shall be greater then 0`
    ),
    name: rt.String.withConstraint(
        (s) => s.length > 0 || `name shall not be empty string`
    ),
    reconnectTimeMS: rt.Number.withConstraint(
        (n) => n > 0 || `reconnectTimeMS shall be greater then 0`
    ).optional(),
});

export type tS7RemoteEndpointConfig = rt.Static<typeof S7RemoteEndpointConfig>;

export class S7RemoteEndpoint extends EventEmitter implements S7Endpoint {
    private static getSnap7AreaCode(s7Area: tS7DataAreas): number {
        switch (s7Area) {
            case "DB":
                return 0x84;
            case "M":
                return 0x83;
            case "E":
            case "I":
                return 0x81;
            case "Q":
                return 0x82;
        }
    }

    private _config: tS7RemoteEndpointConfig;
    private _client: S7Client;
    private _connectedToEndpoint = false;
    private _reconnectTimeout?: NodeJS.Timeout;
    private _debug: Debugger;
    private _debugRead: Debugger;
    private _debugWrite: Debugger;

    constructor(config: tS7RemoteEndpointConfig) {
        super();
        this._config = S7RemoteEndpointConfig.check(config);

        this._client = new S7Client();
        const selfTSAP =
            (Number("0x" + this._config.selfRack) << 8) |
            Number("0x" + this._config.selfSlot);
        const srcTSAP =
            (Number("0x" + this._config.rack) << 8) |
            Number("0x" + this._config.slot);
        this._client.SetConnectionParams(
            this._config.endpointIp,
            selfTSAP,
            srcTSAP
        );

        this._debug = debug(`S7(${this._config.name})`);
        this._debugRead = this._debug.extend("Read");
        this._debugWrite = this._debug.extend("Write");
    }

    /**
     * The name of the endpoint
     */
    get name(): string {
        return this._config.name;
    }

    /**
     * Connection status of the endpoint
     */
    get connected(): boolean {
        if (this._connectedToEndpoint != this._client.Connected()) {
            this._debug(
                `Connection status between endpoint and client is not synchronous`
            );
        }
        return this._connectedToEndpoint && this._client.Connected();
    }

    /**
     * Connects the client to the s7 endpoint
     */
    connect() {
        this._client.Connect((err: any) => {
            if (err != undefined) {
                this._debug(
                    `Error at client.Connect: ${this._client.ErrorText(err)}`
                );
                this.scheduleReconnect();
            } else {
                delete this._reconnectTimeout;
                this._connectedToEndpoint = true;
                this._debug("Client successfully connected");
                this.emit("connect");
            }
        });
    }

    /**
     * disconnects the client from the s7 endpoint
     */
    disconnect() {
        if (this._connectedToEndpoint) {
            this._debug("Called disconnect()");
            this._client.Disconnect();
            this._connectedToEndpoint = false;
            this.emit("disconnect");
            if (this._config.reconnectTimeMS != undefined) {
                this._debug(`Called schedule reconnect in disconnect()`);
                this.scheduleReconnect();
            }
        }
    }

    /**
     * Stops the client also stops trying to reconnect
     */
    stop() {
        if (this.connected) {
            this.disconnect();
        }
        if (this._reconnectTimeout != undefined) {
            clearTimeout(this._reconnectTimeout);
            this._reconnectTimeout = undefined;
        }
    }

    private scheduleReconnect() {
        if (
            this._config.reconnectTimeMS != undefined &&
            this._reconnectTimeout == undefined
        ) {
            this._debug(
                `Set timeout for reconnect in ${this._config.reconnectTimeMS}ms`
            );
            this._reconnectTimeout = setTimeout(() => {
                this._reconnectTimeout = undefined;
                this.connect();
            }, this._config.reconnectTimeMS);
        }
    }

    /**
     * Creates a ReadRequest object for the given tags
     * @param tags the tags to read for this request
     * @returns the request object
     */
    createReadRequest(tags: tS7Variable[]): ReadRequest {
        return new ReadRequest(tags, this);
    }

    /**
     * Creates a WriteRequest object for the given tags
     * @param tags the tags to write for this request
     * @returns the request object
     */
    createWriteRequest(tags: tS7Variable[]): WriteRequest {
        return new WriteRequest(tags, this);
    }

    /**
     * Reads the bytes of the given data block address
     * @param dbNr the number of the datablock to read
     * @param dbIndex the index to read from
     * @param length the number of bytes to read
     * @returns
     */
    readAreaBytes(
        area: tS7DataAreas,
        dbNr: number,
        dbIndex: number,
        length: number
    ): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            if (this.connected) {
                this._client.ReadArea(
                    S7RemoteEndpoint.getSnap7AreaCode(area),
                    dbNr,
                    dbIndex,
                    length,
                    0x02, //S7WLByte
                    (err: any, data: Buffer) => {
                        if (err != undefined) {
                            this._debugRead(
                                `Error at readBytes: ${this._client.ErrorText(
                                    err
                                )}`
                            );
                            this.disconnect();
                            reject(this._client.ErrorText(err));
                        } else {
                            if (
                                Buffer.isBuffer(data) &&
                                data.length == length
                            ) {
                                resolve(data);
                            } else {
                                this._debugRead(
                                    `Error at readBytes data length not equal to requested length: ${data.length}/${length}`
                                );
                                reject(new Error("Data not expected length"));
                            }
                        }
                    }
                );
            } else {
                this._debugRead(`Endpoint not connected during readBytes`);
                reject(new Error(`Endpoint not connected during readBytes`));
            }
        });
    }

    /**
     * Reads multiple variables at once (api level)
     * @param tags the tags to read
     * @returns
     */
    readMultiVars(tags: MultiVarRead[]): Promise<MultiVarsReadResult[]> {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                this._client.ReadMultiVars(
                    tags,
                    (err: any, data: MultiVarsReadResult[]) => {
                        if (err != undefined) {
                            this._debugRead(
                                `Error at readMultiVars: ${this._client.ErrorText(
                                    err
                                )}`
                            );
                            this.disconnect();
                            reject(new Error(this._client.ErrorText(err)));
                        } else {
                            resolve(data);
                        }
                    }
                );
            } else {
                this._debugRead(`Endpoint not connected during readMultiVars`);
                reject(
                    new Error(`Endpoint not connected during readMultiVars`)
                );
            }
        });
    }

    /**
     * Writes the bytes of the given data block address
     * @param dbNr the number of the datablock to write
     * @param dbIndex the index to write to
     * @param length the number of bytes to write
     * @returns
     */
    writeAreaBytes(
        area: tS7DataAreas,
        dbNr: number,
        dbIndex: number,
        buf: Buffer
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.connected) {
                this._client.WriteArea(
                    S7RemoteEndpoint.getSnap7AreaCode(area),
                    dbNr,
                    dbIndex,
                    buf.length,
                    0x02, //S7WLByte
                    buf,
                    (err) => {
                        if (err != undefined) {
                            this._debugWrite(
                                `Error at writeBytes: ${this._client.ErrorText(
                                    err
                                )}`
                            );
                            this.disconnect();
                            reject(new Error(this._client.ErrorText(err)));
                        } else {
                            resolve();
                        }
                    }
                );
            } else {
                this._debugRead(`Endpoint not connected during writeBytes`);
                reject(new Error(`Endpoint not connected during writeBytes`));
            }
        });
    }

    /**
     * Write multiple tags at once (api level)
     * @param tags the tags to write
     * @returns
     */
    writeMultiVars(tags: MultiVarWrite[]): Promise<MultiVarsWriteResult[]> {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                this._client.WriteMultiVars(
                    tags,
                    (err: any, data: MultiVarsWriteResult[]) => {
                        if (err != undefined) {
                            this._debugWrite(
                                `Error at writeMultiVars: ${this._client.ErrorText(
                                    err
                                )}`
                            );
                            this.disconnect();
                            reject(new Error(this._client.ErrorText(err)));
                        } else {
                            resolve(data);
                        }
                    }
                );
            } else {
                this._debugRead(`Endpoint not connected during writeMultiVars`);
                reject(
                    new Error(`Endpoint not connected during writeMultiVars`)
                );
            }
        });
    }
}
