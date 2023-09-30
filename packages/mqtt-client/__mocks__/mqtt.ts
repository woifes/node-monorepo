// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { EventEmitter } from "events";
import { Message } from "../src/Message";

export class MqttClientMock extends EventEmitter {
    public _connected = false;

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
        const packet: any = { ...msg.publishOpts };
        packet.properties = msg.properties;
        this.emit(
            "message",
            msg.topic.join("/"),
            Buffer.from(msg.body, "utf-8"),
            packet,
        );
    }

    publish = jest.fn().mockImplementation(
        (
            topic: string,
            payload: string,
            publishOpts: { qos: number; retain: boolean },
            //biome-ignore lint/complexity/noBannedTypes: ok
            cb?: Function,
        ) => {
            if (cb !== undefined) {
                cb();
            }
        },
    );
    subscribe = jest.fn().mockImplementationOnce(
        //biome-ignore lint/complexity/noBannedTypes: ok
        (topic: string, opts: { qos: number }, cb?: Function) => {
            if (cb !== undefined) {
                cb();
            }
        },
    );
    unsubscribe = jest
        .fn()
        //biome-ignore lint/complexity/noBannedTypes: ok
        .mockImplementation((topic: string, cb?: Function) => {
            if (cb !== undefined) {
                cb();
            }
        });
}

export const connect = jest.fn().mockImplementation(() => {
    return new MqttClientMock();
});
