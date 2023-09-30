// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client } from "@woifes/mqtt-client";
import { MqttConnection } from "@woifes/mqtt-client/decorator";
import {
    S7Endpoint,
    parseS7AddressString,
    tS7Variable,
} from "@woifes/s7endpoint";
import { Debugger } from "debug";
import { S7Output } from "../outputs";
import { LifeSignConfig, rtLifeSignConfig } from "./LifeSignConfig";

const SRC_LIFE_SIGN_TAG_NAME = "SrcLifeSign";
const MAX_UINT16 = 2 ** 16 - 1;

export class LifeSign {
    private _outSign = false;
    private _outOldSignVal = -1;
    private _outSignTime = 0;
    private _outTimeout?: NodeJS.Timeout;

    private _outS7Output?: S7Output;

    private _inIsBit?: boolean;
    private _inSignValue = 0;
    private _inTimeout?: NodeJS.Timeout;

    private _config: LifeSignConfig;
    private _mqtt: Client;
    private _s7Endpoint: S7Endpoint;
    private _debug: Debugger;

    constructor(
        config: LifeSignConfig,
        s7endpoint: S7Endpoint,
        @MqttConnection() mqtt: Client,
        parentDebugger: Debugger,
    ) {
        this._config = rtLifeSignConfig.check(config);
        this._mqtt = mqtt;
        this._s7Endpoint = s7endpoint;
        this._debug = parentDebugger.extend("LifeSign");
        if (this._config.out) {
            this._outS7Output = new S7Output(
                {
                    tags: {
                        [`${SRC_LIFE_SIGN_TAG_NAME}`]: this._config.out.address,
                    },
                    pollIntervalMS: this._config.out.timeoutMS / 2,
                },
                this._s7Endpoint,
                this._debug,
            );
            this._outS7Output.on("data", this.onOutSignData.bind(this));
            this.startOutSignTimeout();
        }
        if (this._config.in !== undefined) {
            const inAddr = parseS7AddressString(this._config.in.address);
            this._inIsBit = inAddr.type === "BIT";
            this.startInSignTimeout();
        }
    }

    set lifeSign(ls: boolean) {
        this._outSign = ls;
        this._outSignTime = Date.now();
        this.sendLifeSign();
    }

    get lifeSign(): boolean {
        return this._outSign;
    }

    /**
     * Event handler for the S7Output data event.
     * @param signs data from the event
     */
    private onOutSignData(signs: tS7Variable[]) {
        const sign = signs[0];
        if (sign.value !== this._outOldSignVal) {
            this.lifeSign = true;
            this.startOutSignTimeout();
            this._outOldSignVal = sign.value as number;
        }
    }

    /**
     * (Re)starts the timeout for the output life sign.
     */
    private startOutSignTimeout() {
        if (this._config.out !== undefined) {
            if (this._outTimeout !== undefined) {
                clearTimeout(this._outTimeout);
                delete this._outTimeout;
            }
            this._outTimeout = setTimeout(
                this.onOutSignTimeout.bind(this),
                this._config.out.timeoutMS,
            );
        }
    }

    /**
     * Event handler for the output life sign timeout.
     */
    private onOutSignTimeout() {
        this.lifeSign = false;
        delete this._outTimeout;
    }

    /**
     * Sends the life sign information to the configured MQTT topic.
     */
    private sendLifeSign() {
        if (this._config.out?.topic !== undefined) {
            const options: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                fractionalSecondDigits: 3,
            };
            const date = new Date(this._outSignTime);
            this._mqtt.publishValueSync(
                this._config.out.topic,
                {
                    lifeSign: this._outSign ? 1 : 0,
                    lastlifeSignTime: date.toLocaleString(undefined, options), // date string?
                },
                "JSON",
            );
        }
    }

    /**
     * Stop function mainly for unit tests
     */
    stopPolling() {
        if (this._outS7Output !== undefined) {
            this._outS7Output.stopPolling();
            if (this._outTimeout !== undefined) {
                clearTimeout(this._outTimeout);
                delete this._outTimeout;
            }
        }
    }

    /**
     * (Re)starts the timout for the input life sign cycle.
     * Expects the config for an input life sign is present.
     */
    private startInSignTimeout() {
        if (this._inTimeout !== undefined) {
            clearTimeout(this._inTimeout);
            delete this._inTimeout;
        }
        this._inTimeout = setTimeout(
            this.onInSignTimeout.bind(this),
            this._config.in!.cycleMS,
        );
    }

    /**
     * Event handler for the input life sign timeout.
     */
    private onInSignTimeout() {
        this.writeInSign().finally(() => {
            this.startInSignTimeout();
        });
    }

    /**
     * Writes the input life sign to the device.
     * A BIT type target will be toggled, a UINT16 target will be incremented.
     */
    private async writeInSign() {
        if (this._inIsBit) {
            if (this._inSignValue === 0) {
                this._inSignValue = 1;
            } else {
                this._inSignValue = 0;
            }
        } else {
            if (this._inSignValue === MAX_UINT16) {
                this._inSignValue = 0;
            } else {
                this._inSignValue++;
            }
        }
        const writeReq = this._s7Endpoint.createWriteRequest([
            {
                ...parseS7AddressString(this._config.in!.address),
                value: this._inSignValue,
            },
        ]);
        await writeReq.execute();
    }

    /**
     * Stops the input life sign cycle (mainly for unit tests)
     */
    stopCycle() {
        if (this._inTimeout !== undefined) {
            clearTimeout(this._inTimeout);
            delete this._inTimeout;
        }
    }
}
