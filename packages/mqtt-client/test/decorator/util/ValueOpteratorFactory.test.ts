// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { QoS } from "mqtt";
import * as rt from "runtypes";
import { Observable, Subject } from "rxjs";
import { Message } from "../../../src/Message";
import { ValueOperatorFactory } from "../../../src/decorator/util/ValueOperatorFactory";

async function promiseTimeout(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

let sub: Subject<Message>;
let obs: Observable<Message>;
let cb: jest.Mock;

function pushMessage(content: string, qos: QoS) {
    sub.next(new Message("a/b/c", qos, false, content));
}

beforeEach(() => {
    sub = new Subject();
    obs = sub.asObservable();
    cb = jest.fn();
    jest.clearAllMocks();
});

describe("test from MsgOperatorFactory", () => {
    it("should trottle incoming messages and use min QoS", async () => {
        const o1 = obs
            .pipe(
                ValueOperatorFactory({
                    topic: "",
                    type: "UINT8",
                    minQos: 1,
                    throttleMS: 200,
                }),
            )
            .subscribe(cb);

        pushMessage("1", 0);
        await promiseTimeout(300);
        pushMessage("1", 1);
        await promiseTimeout(50);
        pushMessage("1", 1);
        await promiseTimeout(300);
        pushMessage("1", 0);
        expect(cb).toBeCalledTimes(1);
    });
});

describe("type validation test", () => {
    it("should allow the correct value", () => {
        const o1 = obs
            .pipe(
                ValueOperatorFactory({
                    topic: "",
                    type: "UINT8",
                }),
            )
            .subscribe(cb);
        pushMessage("0", 0);
        pushMessage("255", 0);
        pushMessage("256", 0);
        expect(cb).toBeCalledTimes(2);
        expect(cb).toBeCalledWith(0);
        expect(cb).toBeCalledWith(255);
    });

    it("should usw fallback value", () => {
        const o1 = obs
            .pipe(
                ValueOperatorFactory({
                    topic: "",
                    type: "UINT8",
                    fallBackValue: 7,
                }),
            )
            .subscribe(cb);
        pushMessage("0", 0);
        pushMessage("255", 0);
        pushMessage("256", 0);
        expect(cb).toBeCalledTimes(3);
        expect(cb).toBeCalledWith(0);
        expect(cb).toBeCalledWith(255);
        expect(cb).toBeCalledWith(7);
    });

    it("should use JSON value", () => {
        const o1 = obs
            .pipe(
                ValueOperatorFactory({
                    topic: "",
                    type: "JSON",
                    fallBackValue: 7,
                }),
            )
            .subscribe(cb);
        pushMessage(JSON.stringify({ A: 1, B: "b" }), 0);
        pushMessage(JSON.stringify({ A: 2 }), 0);
        pushMessage(JSON.stringify({ B: "c" }), 0);
        expect(cb).toBeCalledTimes(3);
        expect(cb).toBeCalledWith({ A: 1, B: "b" });
        expect(cb).toBeCalledWith({ A: 2 });
        expect(cb).toBeCalledWith({ B: "c" });
    });

    it("should use JSON value", () => {
        const o1 = obs
            .pipe(
                ValueOperatorFactory({
                    topic: "",
                    type: "JSON",
                    fallBackValue: 7,
                    runtype: rt.Record({
                        A: rt.Number,
                        B: rt.String,
                    }),
                }),
            )
            .subscribe(cb);
        pushMessage(JSON.stringify({ A: 1, B: "b" }), 0);
        pushMessage(JSON.stringify({ A: "a", B: 2 }), 0);
        pushMessage(JSON.stringify({ B: "c" }), 0);
        expect(cb).toBeCalledTimes(3);
        expect(cb).toBeCalledWith({ A: 1, B: "b" });
        expect(cb).toBeCalledWith(7);
        expect(cb).toBeCalledWith(7);
    });

    it("should use STRING value", () => {
        const o1 = obs
            .pipe(
                ValueOperatorFactory({
                    topic: "",
                    type: "STRING",
                }),
            )
            .subscribe(cb);
        pushMessage("Hello World", 0);
        expect(cb).toBeCalledTimes(1);
        expect(cb).toBeCalledWith("Hello World");
    });
});
