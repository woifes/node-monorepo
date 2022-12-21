// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Message } from "../../src/Message";
import { SubscriberList } from "../../src/utils/SubscriberList";

test("add handler function", () => {
    let list = new SubscriberList(["A", "B", "C"]);
    const h1 = jest.fn();
    const h2 = jest.fn();
    const h3 = jest.fn();

    expect(list.topic).toEqual(["A", "B", "C"]);

    list.addSuscriber(h1, 0);
    expect(list.size).toBe(1);
    expect(list.maxQos).toBe(0);

    list.addSuscriber(h2, 1);
    expect(list.size).toBe(2);
    expect(list.maxQos).toBe(1);

    list.addSuscriber(h3, 2);
    expect(list.size).toBe(3);
    expect(list.maxQos).toBe(2);

    list = new SubscriberList(["A", "B", "C"]);
    list.addSuscriber(h1, 2);
    expect(list.size).toBe(1);
    expect(list.maxQos).toBe(2);
});

test("remove handler function", () => {
    const list = new SubscriberList(["A", "B", "C"]);
    const h1 = jest.fn();
    const h2 = jest.fn();
    const h3 = jest.fn();

    list.addSuscriber(h1, 0);
    list.addSuscriber(h2, 1);
    list.addSuscriber(h3, 2);
    expect(list.size).toBe(3);
    expect(list.maxQos).toBe(2);

    list.removeSubscriber(h1);
    expect(list.size).toBe(2);
    expect(list.maxQos).toBe(2);

    list.removeSubscriber(h2);
    expect(list.size).toBe(1);
    expect(list.maxQos).toBe(2);

    list.removeSubscriber(h3);
    expect(list.size).toBe(0);
    expect(list.maxQos).toBe(0);

    //empty

    list.addSuscriber(h1, 0);
    list.addSuscriber(h2, 1);
    expect(list.size).toBe(2);
    expect(list.maxQos).toBe(1);

    list.removeSubscriber(h1);
    expect(list.size).toBe(1);
    expect(list.maxQos).toBe(1);
});

test("distribute message", () => {
    const list = new SubscriberList(["A", "B", "C"]);
    const h1 = jest.fn();
    const h2 = jest.fn();
    const h3 = jest.fn();
    const m = new Message("A/B/C", 0, false);

    list.addSuscriber(h1, 0);
    list.addSuscriber(h2, 1);
    list.addSuscriber(h3, 2);

    expect(list.sendMessage(m)).toBe(3);
    expect(h1).toBeCalledTimes(1);
    expect(h2).toBeCalledTimes(1);
    expect(h3).toBeCalledTimes(1);
});

it("should be robust agains expections inside the handler", () => {
    const list = new SubscriberList(["A", "B", "C"]);
    const h1 = jest.fn();
    const h2 = jest.fn();
    h2.mockImplementation(() => {
        throw new Error("Bad thing happened");
    });
    const h3 = jest.fn();
    const m = new Message("A/B/C", 0, false);

    list.addSuscriber(h1, 0);
    list.addSuscriber(h2, 1);
    list.addSuscriber(h3, 2);

    expect(list.sendMessage(m)).toBe(3);
    expect(h1).toBeCalledTimes(1);
    expect(h2).toBeCalledTimes(1);
    expect(h3).toBeCalledTimes(1);
});
