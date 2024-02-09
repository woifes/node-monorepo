// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Debugger } from "debug";
import { Packet } from "mqtt-packet";
import { IStore } from "mqtt/*";
import { Readable } from "readable-stream";

//type Packet = { messageId: number; topic?: string };

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
export class UniqueTopicStore implements IStore {
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
    public put(packet: Packet, cb: (error?: Error) => void) {
        this.debug("put packet %O", packet);
        const found = this._inflights.get(packet.messageId);
        if (found !== undefined && found.topic !== undefined) {
            this._reverseMap.delete(found.topic);
        }

        if ((packet as any).topic !== undefined) {
            const msgId = this._reverseMap.get((packet as any).topic);
            if (msgId !== undefined) {
                this.debug(
                    `delete packet with same topic. topic: ${
                        (packet as any).topic
                    }`,
                );
                this._inflights.delete(msgId);
            }
            this._reverseMap.set((packet as any).topic, packet.messageId);
        }

        this._inflights.set(packet.messageId, packet);

        cb();

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
    public del(
        packet: Pick<Packet, "messageId">,
        cb: (error?: Error, packet?: Packet) => void,
    ) {
        this.debug("delete packet %O", packet);
        const foundPacket = this._inflights.get(packet.messageId);
        if (foundPacket !== undefined) {
            this._inflights.delete(foundPacket.messageId);
            if ((foundPacket as any).topic !== undefined) {
                this._reverseMap.delete((foundPacket as any).topic);
            }
            cb(undefined, foundPacket);
        } else if (cb !== undefined) {
            cb(new Error("missing packet"));
        }

        return this;
    }

    /**
     * get a packet from the store.
     */
    public get(
        packet: Pick<Packet, "messageId">,
        cb: (error?: Error, packet?: Packet) => void,
    ) {
        const foundPacket = this._inflights.get(packet.messageId);
        if (foundPacket !== undefined) {
            cb(undefined, foundPacket);
        } else if (cb !== undefined) {
            cb(new Error("missing packet"));
        }

        return this;
    }

    /**
     * Close the store
     */
    public close(cb: (error?: Error) => void) {
        this._inflights = new Map();
        this._reverseMap = new Map();

        if (cb !== undefined) {
            cb();
        }
    }
}
