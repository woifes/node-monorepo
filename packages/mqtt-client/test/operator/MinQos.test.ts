// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { QoS } from "mqtt-packet";
import { Observable, Subject } from "rxjs";
import { Message } from "../../src/Message";
import { MinQos } from "../../src/operator/MinQos";

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

it("should allow only the minimal qos", () => {
    obs.pipe(MinQos(1)).subscribe(cb);
    pushMessage("0", 0);
    pushMessage("1", 1);
    pushMessage("2", 2);
    pushMessage("0", 0);
    pushMessage("1", 1);
    pushMessage("2", 2);
    expect(cb).toBeCalledTimes(4);
    expect(cb.mock.calls[0][0].qos).toBe(1);
    expect(cb.mock.calls[1][0].qos).toBe(2);
    expect(cb.mock.calls[2][0].qos).toBe(1);
    expect(cb.mock.calls[3][0].qos).toBe(2);
});
