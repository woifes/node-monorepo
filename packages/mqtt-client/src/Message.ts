// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
    DataTypes,
    TypeName,
    rtString,
    tJsVal,
    tVal,
} from "@woifes/binarytypes";
import { parse as JSON5parse } from "json5";
import { IPublishPacket, QoS } from "mqtt-packet";
import { Runtype } from "runtypes";
import { Client } from "./Client";

export declare interface Message {
    readJSON(runtype: undefined, fallBackVal?: any): any;
    readJSON<T>(runtype?: Runtype<T>, fallBackVal?: T): T;
}

export type MqttPubPacketProperties = IPublishPacket["properties"];

/**
 * This object represents a mqtt message. Either a received one with a message body, or to generate a message which can be send via the mqtt client.
 * @param topic the topic of the mqtt message
 * @param qos the QoS of the mqtt message
 * @param retain retain flag of the mqtt message
 * @param body the message body of the mqtt message - optional
 * @param client the client object which can be used with the send method - optional
 */
export class Message {
    private _body: string;
    private _qos: QoS = 0;
    private _retain = false;
    private _topic: string[];
    private _properties?: MqttPubPacketProperties;
    private _client?: Client;

    private _creation: number;

    /**
     * Creates a deep copy of the given message object
     * @param original the original message object
     * @returns deep copy of the given message object
     */
    static copy(original: Message): Message {
        const m = new Message(
            original._topic.join("/"),
            original._qos,
            original._retain,
            original._body,
            original.client,
        );
        if (original.properties !== undefined) {
            m.properties = JSON.parse(JSON.stringify(original.properties));
        }
        m._creation = original._creation;
        return m;
    }

    constructor(
        topic: string,
        qos: QoS = 0,
        retain = false,
        body?: string,
        client?: Client,
    ) {
        this._qos = qos;
        this._retain = retain;
        this._topic = topic.split("/");
        this._body = body ?? "";
        this._client = client;

        this._creation = Date.now();
    }

    set qos(q: QoS) {
        this._qos = q;
    }

    get qos(): QoS {
        return this._qos;
    }

    set retain(r: boolean) {
        this._retain = r;
    }

    get retain(): boolean {
        return this._retain;
    }

    set properties(p: MqttPubPacketProperties | undefined) {
        this._properties = p;
    }

    get properties(): MqttPubPacketProperties | undefined {
        return this._properties;
    }

    get publishOpts(): { qos: QoS; retain: boolean } {
        return {
            qos: this._qos,
            retain: this._retain,
        };
    }

    get creation(): number {
        return this._creation;
    }

    get topic(): string[] {
        return this._topic;
    }

    get body(): string {
        return this._body;
    }

    get client(): Client | undefined {
        return this._client;
    }

    /**
     * Reads a value of a given type from the message. Throws if something is wrong
     * @param type the type to read
     * @returns the value red
     */
    readValue(type: TypeName, fallBackVal?: tJsVal): tJsVal {
        try {
            return DataTypes[type].check(this._body);
        } catch (e) {
            if (fallBackVal !== undefined) {
                return fallBackVal;
            }
            throw e;
        }
    }

    /**
     * Reads the message body and parses it. If provided uses runtype check. If no fallback value is provided throws on error
     * @param runtype a runtype to use on the parsed result
     * @param fallBackVal a fallback value which is returned if an error occurs
     * @returns
     */
    readJSON(runtype?: Runtype, fallBackVal?: any): any {
        try {
            const res = JSON5parse(this._body);
            if (runtype !== undefined) {
                return <any>runtype.check(res);
            }
            return res;
        } catch (e) {
            if (fallBackVal !== undefined) {
                return fallBackVal;
            }
            throw e;
        }
    }

    /**
     * Checks if the topic contains a valid command array
     * @param expected Array of types expected
     * @returns Array of the values. The length of the array can be lower than the expected length.
     * It is only guaranteed that all existing values in the array match the types expected
     */
    readCommand(expected: (TypeName | "STRING")[]): tJsVal[] {
        const res: tJsVal[] = [];
        try {
            const parsed = JSON5parse(this._body);
            if (Array.isArray(parsed)) {
                for (let i = 0; i < parsed.length; i++) {
                    if (expected[i] === undefined) {
                        break;
                    }
                    if (expected[i] === "STRING") {
                        try {
                            res[i] = <string>rtString.check(parsed[i]); //No Buffer can occur here
                        } catch {
                            break;
                        }
                    } else {
                        try {
                            res[i] = DataTypes[expected[i] as TypeName].check(
                                parsed[i],
                            );
                        } catch {
                            break;
                        }
                    }
                }
                return res;
            }
            throw new Error("parsed set is not an array");
        } catch {
            return [];
        }
    }

    /**
     * Writes the given value to the body of the message
     * @param type the type the value "should" have
     * @param value The value to write
     * @returns true of false depending on success
     */
    writeValue(value: tVal, type: TypeName | "STRING" = "STRING"): boolean {
        try {
            if (type !== "STRING") {
                this._body = DataTypes[type].toString(value);
                return true;
            }
            const str = String(value);
            if (typeof str === "string" && str.length > 0) {
                this._body = str;
                return true;
            }
            throw new Error(
                "value to write as string could not be converted to string",
            );
        } catch {
            return false;
        }
    }

    /**
     * Write the given value as parsed JSON string (JSON5)
     * @param value the object to write
     * @returns true of false depending on success
     */
    writeJSON(value: any): boolean {
        try {
            this._body = JSON.stringify(value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Tries to send the message to the intern set client. No check.
     */
    sendSync() {
        this.send().catch(() => {});
    }

    /**
     * Tries to send message to the intern client.
     * @returns
     */
    send() {
        if (this._client !== undefined) {
            return this._client.publishMessage(this);
        }
        return Promise.reject(
            new Error(
                `tried to send message without set client. Topic:${this.topic.join(
                    "/",
                )}. Payload: ${this.body}`,
            ),
        );
    }
}
