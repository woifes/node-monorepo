// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
    dbSourceToS7Variables,
    parseS7AddressString,
    ReadRequest,
    S7Endpoint,
    tS7Variable,
} from "@woifes/s7endpoint";
import { Debugger } from "debug";
import { EventEmitter } from "events";
import { readFileSync } from "fs-extra";
import { S7OutputConfig, tS7OutputConfig } from "./S7OutputConfig";

export const STD_POLL_INTERVAL_MS = 1000;

export declare interface S7Output {
    on(event: "data", listener: (tags: tS7Variable[]) => void): this;
    on(event: "pollingStarted", listener: () => void): this;
    on(event: "pollingStopped", listener: () => void): this;
    once(event: "data", listener: (tags: tS7Variable[]) => void): this;
    once(event: "pollingStarted", listener: () => void): this;
    once(event: "pollingStopped", listener: () => void): this;
}

/**
 * Cyclical polling of variables from the plc
 */
export class S7Output extends EventEmitter {
    private readonly POLL_INTERVAL_MS: number;

    private _continuePolling = false;
    private _pollingActive = false;
    private _readReq: ReadRequest;

    private _debug: Debugger;
    private _config: tS7OutputConfig;
    private _s7ep: S7Endpoint;

    // rome-ignore lint/correctness/noUnreachableSuper: Seems to be false positive because of "Object.entries"
    constructor(
        config: tS7OutputConfig,
        s7endpoint: S7Endpoint,
        parentDebugger: Debugger,
    ) {
        super();
        this._config = S7OutputConfig.check(config);
        this._s7ep = s7endpoint;

        this.POLL_INTERVAL_MS =
            this._config.pollIntervalMS ?? STD_POLL_INTERVAL_MS;
        this._debug = parentDebugger.extend(`output:${this.POLL_INTERVAL_MS}`);
        let tags: tS7Variable[] = [];
        if (this._config.tags !== undefined) {
            for (const [name, address] of Object.entries(this._config.tags)) {
                const addressObject = parseS7AddressString(address);
                tags.push({ name, ...addressObject });
            }
        }
        if (this._config.datablocks !== undefined) {
            for (const datablock of this._config.datablocks) {
                try {
                    //first try to parse the string
                    tags = [
                        ...tags,
                        ...dbSourceToS7Variables(
                            datablock.filePathOrContent,
                            datablock.dbNr,
                        ),
                    ];
                } catch {
                    //second try to find the file
                    const fileContent = readFileSync(
                        datablock.filePathOrContent,
                        {
                            encoding: "utf-8",
                        },
                    );
                    tags = [
                        ...tags,
                        ...dbSourceToS7Variables(fileContent, datablock.dbNr),
                    ];
                }
            }
        }

        this._readReq = this._s7ep.createReadRequest(tags);
        this._s7ep.on("connect", this.startPolling.bind(this));
        this._s7ep.on("disconnect", () => {});
        this.startPolling();
    }

    startPolling() {
        if (
            this._s7ep.connected &&
            !this._continuePolling &&
            !this._pollingActive
        ) {
            this._continuePolling = true;
            this.poll();
            this.emit("pollingStarted");
        }
    }

    stopPolling() {
        this._continuePolling = false;
    }

    private poll() {
        this._pollingActive = true;
        let pollIntervalMS = this.POLL_INTERVAL_MS;
        this._readReq
            .execute()
            .then((tags: tS7Variable[]) => {
                this.emit("data", tags);
            })
            .catch((e) => {
                pollIntervalMS = this.POLL_INTERVAL_MS * 2;
                this._debug(`Error in execute readRequest of poll(): ${e}`);
            })
            .finally(() => {
                if (this._continuePolling) {
                    setTimeout(() => {
                        this.poll();
                    }, pollIntervalMS);
                } else {
                    this._pollingActive = false;
                    this.emit("pollingStopped");
                }
            });
    }
}
