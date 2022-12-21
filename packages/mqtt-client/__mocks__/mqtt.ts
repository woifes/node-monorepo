// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

/* eslint-disable @typescript-eslint/ban-types */

import { EventEmitter } from "events";
import { Message } from "../src/Message";

export class MqttClientMock extends EventEmitter {
    public _connected = false;

    constructor() {
        super();
    }

    set connected(c: boolean) {
        const emitConnect = !this._connected && c;
        const emitOffline = this._connected && !c;
        this._connected = c;
        if (emitConnect) {
            this.emit("connect");
        }
        if (emitOffline) {
            this.emit("offline");
        }
    }

    get connected(): boolean {
        return this._connected;
    }

    emitMessage(msg: Message) {
        this.emit(
            "message",
            msg.topic.join("/"),
            Buffer.from(msg.body, "utf-8"),
            msg.publishOpts
        );
    }

    publish = jest
        .fn()
        .mockImplementation(
            (
                topic: string,
                payload: string,
                publishOpts: { qos: number; retain: boolean },
                cb?: Function
            ) => {
                if (cb != undefined) {
                    cb();
                }
            }
        );
    subscribe = jest
        .fn()
        .mockImplementationOnce(
            (topic: string, opts: { qos: number }, cb?: Function) => {
                if (cb != undefined) {
                    cb();
                }
            }
        );
    unsubscribe = jest
        .fn()
        .mockImplementation((topic: string, cb?: Function) => {
            if (cb != undefined) {
                cb();
            }
        });
}

export const connect = jest.fn().mockImplementation(() => {
    return new MqttClientMock();
});
