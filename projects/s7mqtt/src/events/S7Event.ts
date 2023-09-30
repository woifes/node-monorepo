// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
    S7Endpoint,
    parseS7AddressString,
    tS7Variable,
} from "@woifes/s7endpoint";
import { Debugger } from "debug";
import { EventEmitter } from "events";
import { S7Output } from "../outputs/S7Output";
import { S7EventConfig, tS7EventConfig } from "./S7EventConfig";

const STD_POLL_INTERVAL_MS = 1000;

export declare interface S7Event {
    on(
        event: "trigger",
        listener: (newTrigger: tS7Variable, params: tS7Variable[]) => void,
    ): this;
    on(event: "pollingStarted", listener: () => void): this;
    on(event: "pollingStopped", listener: () => void): this;
    once(
        event: "trigger",
        listener: (newTrigger: tS7Variable, params: tS7Variable[]) => void,
    ): this;
    once(event: "pollingStarted", listener: () => void): this;
    once(event: "pollingStopped", listener: () => void): this;
}

export class S7Event extends EventEmitter {
    private _debug: Debugger;
    private _config: tS7EventConfig;
    private _s7ep: S7Endpoint;

    private _output: S7Output;

    private _lastTrigger?: tS7Variable;

    constructor(
        config: tS7EventConfig,
        s7endpoint: S7Endpoint,
        parentDebugger: Debugger,
    ) {
        super();
        this._config = S7EventConfig.check(config);
        this._debug = parentDebugger.extend("event");
        this._s7ep = s7endpoint;
        const pollIntervalMS =
            this._config.pollIntervalMS ?? STD_POLL_INTERVAL_MS;

        this._output = new S7Output(
            {
                pollIntervalMS,
                tags: { trigger: this._config.trigger },
            },
            this._s7ep,
            this._debug,
        );
        this._output.on("pollingStarted", () => {
            this.emit("pollingStarted");
        });
        this._output.on("pollingStopped", () => {
            this.emit("pollingStopped");
        });
        this._output.on("data", this.onData.bind(this));
    }

    stopPolling() {
        this._output.stopPolling();
    }

    private async fetchParams(): Promise<tS7Variable[]> {
        const paramVars: tS7Variable[] = [];
        if (this._config.params !== undefined) {
            for (const param of this._config.params) {
                paramVars.push({
                    ...parseS7AddressString(param),
                });
            }
            const readRequest = this._s7ep.createReadRequest(paramVars);
            const result = await readRequest.execute();
            if (this._config.params.length !== result.length) {
                throw new Error(
                    "Fetched params count is not matching config param counts",
                );
            }
            this._debug(`Fetched ${result.length} parameters`);
            return result;
        }
        return paramVars;
    }

    private onData(data: tS7Variable[]) {
        const newTrigger = data[0];
        if (newTrigger !== undefined) {
            if (
                this._lastTrigger !== undefined &&
                newTrigger.value !== this._lastTrigger.value
            ) {
                this._debug(`New trigger value: ${newTrigger.value}`);
                this.onTrigger(newTrigger);
            }
            this._lastTrigger = newTrigger;
        }
    }

    private onTrigger(newTrigger: tS7Variable) {
        this.fetchParams()
            .then((params) => {
                this.emit("trigger", newTrigger, [...params]);
            })
            .catch((e) => {
                this._debug(`Error at fetchParams: ${e}`);
            });
    }
}
