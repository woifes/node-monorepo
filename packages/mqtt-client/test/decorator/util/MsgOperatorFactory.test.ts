// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Observable, Subject } from "rxjs";
import { MsgOperatorFactory } from "../../../src/decorator/util/MsgOperatorFactory";
import { Message } from "../../../src/Message";

async function promiseTimeout(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

let sub: Subject<Message>;
let obs: Observable<Message>;
let cb: jest.Mock;
const m1 = new Message("a/b/c", 0, false, "1");
const m2 = new Message("a/b/c", 1, false, "2");
const m3 = new Message("a/b/c", 2, false, "3");
const m4 = new Message("a/b/c", 0, false, "4");
const m5 = new Message("a/b/c", 1, false, "5");

beforeEach(() => {
    sub = new Subject();
    obs = sub.asObservable();
    cb = jest.fn();
    jest.clearAllMocks();
});

it("should throttle messages when configured", async () => {
    const subscription = obs
        .pipe(
            MsgOperatorFactory({
                topic: "",
                throttleMS: 500,
            })
        )
        .subscribe(cb);
    sub.next(m1);
    await promiseTimeout(200);
    sub.next(m2);
    await promiseTimeout(700);
    sub.next(m3);
    await promiseTimeout(700);
    sub.next(m4);
    subscription.unsubscribe();
    expect(cb).toBeCalledTimes(3);
    expect(cb.mock.calls[0][0].body).toBe("1");
    expect(cb.mock.calls[1][0].body).toBe("3");
    expect(cb.mock.calls[2][0].body).toBe("4");
});

it("should only allow minQos", () => {
    const subscription = obs
        .pipe(
            MsgOperatorFactory({
                topic: "",
                minQos: 1,
            })
        )
        .subscribe(cb);
    sub.next(m1);
    sub.next(m2);
    sub.next(m3);
    sub.next(m4);
    sub.next(m5);
    subscription.unsubscribe();
    expect(cb).toBeCalledTimes(3);
    expect(cb.mock.calls[0][0].body).toBe("2");
    expect(cb.mock.calls[1][0].body).toBe("3");
    expect(cb.mock.calls[2][0].body).toBe("5");
});

it("should only allow minQos", async () => {
    const subscription = obs
        .pipe(
            MsgOperatorFactory({
                topic: "",
                throttleMS: 300,
                minQos: 1,
            })
        )
        .subscribe(cb);
    sub.next(m1);
    await promiseTimeout(400);
    sub.next(m2);
    await promiseTimeout(100);
    sub.next(m3);
    await promiseTimeout(400);
    sub.next(m4);
    await promiseTimeout(400);
    sub.next(m5);
    await promiseTimeout(400);
    subscription.unsubscribe();
    expect(cb).toBeCalledTimes(2);
    expect(cb.mock.calls[0][0].body).toBe("2");
    expect(cb.mock.calls[1][0].body).toBe("5");
});
