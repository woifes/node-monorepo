// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Debugger } from "debug";
import { Readable } from "stream";

type Packet = { messageId: number; topic?: string };

const streamsOpts = { objectMode: true };

//interface ReadableStateOptions {
//    defaultEncoding?: BufferEncoding | undefined;
//    encoding?: BufferEncoding | undefined;
//    highWaterMark?: number | undefined;
//    objectMode?: boolean | undefined;
//    readableObjectMode?: boolean | undefined;
//    readableHighWaterMark?: number | undefined;
//}

/**
 * This class is used as the topic store implementation of the mqtt package. The goal is to not store every single inflight and outgoing messages. Instead published messages with one mqtt topic overwrite older ones.
 */
export class UniqueTopicStore {
    private _inflights = new Map();
    private _reverseMap = new Map();

    constructor(private _debug?: Debugger) {}

    debug(line: string, ...args: any[]) {
        if (this._debug !== undefined) {
            this._debug(line, ...args);
        }
    }

    /**
     * Adds a packet to the store, a packet is
     * anything that has a messageId property.
     *
     */
    public put(packet: Packet, cb?: () => void) {
        this.debug("put packet %O", packet);
        const found = this._inflights.get(packet.messageId);
        if (found !== undefined && found.topic !== undefined) {
            this._reverseMap.delete(found.topic);
        }

        if (packet.topic !== undefined) {
            const msgId = this._reverseMap.get(packet.topic);
            if (msgId !== undefined) {
                this.debug(
                    `delete packet with same topic. topic: ${packet.topic}`,
                );
                this._inflights.delete(msgId);
            }
            this._reverseMap.set(packet.topic, packet.messageId);
        }

        this._inflights.set(packet.messageId, packet);

        if (cb) {
            cb();
        }

        return this;
    }

    /**
     * Creates a stream with all the packets in the store
     */
    public createStream() {
        const stream = new Readable(streamsOpts);
        let destroyed = false;
        const values: Packet[] = [];
        let i = 0;

        this._inflights.forEach(function (value) {
            values.push(value);
        });

        stream._read = function () {
            if (!destroyed && i < values.length) {
                this.push(values[i++]);
            } else {
                this.push(null);
            }
        };

        stream.destroy = function (): Readable {
            if (destroyed) {
                return this;
            }
            destroyed = true;

            setTimeout(() => {
                this.emit("close");
            }, 0);
            return this;
        };

        return stream;
    }

    /**
     * deletes a packet from the store.
     */
    public del(packet: Packet, cb: (err: Error | null, packet?: any) => void) {
        this.debug("delete packet %O", packet);
        packet = this._inflights.get(packet.messageId);
        if (packet !== undefined) {
            this._inflights.delete(packet.messageId);
            if (packet.topic !== undefined) {
                this._reverseMap.delete(packet.topic);
            }
            cb(null, packet);
        } else if (cb !== undefined) {
            cb(new Error("missing packet"));
        }

        return this;
    }

    /**
     * get a packet from the store.
     */
    public get(
        packet: Packet,
        cb: (error: Error | null, packet?: Packet) => void,
    ) {
        packet = this._inflights.get(packet.messageId);
        if (packet !== undefined) {
            cb(null, packet);
        } else if (cb !== undefined) {
            cb(new Error("missing packet"));
        }

        return this;
    }

    /**
     * Close the store
     */
    public close(cb: () => void) {
        this._inflights = new Map();
        this._reverseMap = new Map();

        if (cb !== undefined) {
            cb();
        }
    }
}
