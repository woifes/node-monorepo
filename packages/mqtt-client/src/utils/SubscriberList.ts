// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Debugger } from "debug";
import { QoS } from "mqtt-packet";
import { Message } from "../Message";

/**
 * Type to a subscribe handler
 */
export type SubscribeHandler = (msg: Message) => void;

/**
 * This objects holds a list of registered subscriber to a given topic
 */
export class SubscriberList {
    private _debug?: Debugger;

    private _topic: string[];
    private _subscriber: Map<SubscribeHandler, QoS> = new Map<
        SubscribeHandler,
        QoS
    >();
    private _isStatic: boolean;

    constructor(topic: string[], isStatic = false, debug?: Debugger) {
        if (debug != undefined) {
            this._debug = debug.extend(`SL[${topic.join("/")}]`);
        }
        this._topic = topic;
        this._isStatic = isStatic;
    }

    /**
     * Returns the highest QoS for which a handler is subscribed
     */
    get maxQos(): QoS {
        let max: QoS = 0;
        for (const qos of this._subscriber.values()) {
            if (qos > max) {
                max = qos;
            }
            if (max == 2) {
                break;
            }
        }
        return max;
    }

    /**
     * Indicates if the topic is a static subscribed topic
     */
    get isStatic(): boolean {
        return this._isStatic;
    }

    /**
     * The amount of handler functions which are registered (0-3)
     */
    get size(): number {
        return this._subscriber.size;
    }

    /**
     * The topic for the list
     */
    get topic(): string[] {
        return [...this._topic];
    }

    /**
     * Calls each callback with an copy of the message
     * @param msg the message to distribute
     * @returns number of distributions
     */
    sendMessage(msg: Message): number {
        let n = 0;
        for (const sub of this._subscriber.keys()) {
            try {
                sub(Message.copy(msg));
            } catch (e) {
                if (this._debug != undefined) {
                    this._debug(
                        `in sendMessage one subscriber threw an exception: ${e}`
                    );
                }
            } finally {
                n++;
            }
        }
        return n;
    }

    /**
     * adds subscriber handler to the topic list
     * @param fn the subscribe handler
     * @param qos the qos for the given handler
     */
    addSubscriber(fn: SubscribeHandler, qos: QoS) {
        this._subscriber.set(fn, qos);
    }

    /**
     * removes the handler function from the list
     * @param fn the handler function to remove
     * @returns true if a handler was removed
     */
    removeSubscriber(fn: SubscribeHandler): boolean {
        return this._subscriber.delete(fn);
    }
}
