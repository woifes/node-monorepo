// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { UniqueTopicStore } from "../../src/utils/UniqueTopicStore";

test("put without topic and get", () => {
    const store = new UniqueTopicStore();
    const packet = {
        messageId: 42,
    };

    store.put(packet);
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(0);
    store.get({ messageId: 42 }, (err: any, p: any) => {
        expect(p === packet).toBe(true);
    });
});

test("put with topic and get", () => {
    const store = new UniqueTopicStore();
    const packet = {
        topic: "hello",
        messageId: 42,
    };

    store.put(packet);
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(1);
    store.get({ messageId: 42 }, (err: any, p: any) => {
        expect(p === packet).toBe(true);
    });
});

test("put and overide same topic and get", () => {
    const store = new UniqueTopicStore();
    const packet = {
        topic: "hello",
        messageId: 42,
    };
    const packet2 = {
        topic: "hello",
        messageId: 123,
    };

    store.put(packet);
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(1);
    store.put(packet2);
    store.get({ messageId: 123 }, (err: any, p: any) => {
        expect(p === packet2).toBe(true);
    });
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(1);
});

test("put and overide same messageId and get", () => {
    const store = new UniqueTopicStore();
    const packet = {
        messageId: 42,
    };
    const packet2 = {
        messageId: 42,
    };

    store.put(packet);
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(0);
    store.put(packet2);
    store.get({ messageId: 42 }, (err: any, p: any) => {
        expect(p === packet2).toBe(true);
    });
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(0);
});

test("put and overide same messageId but no topic and get", () => {
    const store = new UniqueTopicStore();
    const packet = {
        topic: "hello",
        messageId: 42,
    };
    const packet2 = {
        messageId: 42,
    };

    store.put(packet);
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(1);
    store.put(packet2);
    store.get({ messageId: 42 }, (err: any, p: any) => {
        expect(p === packet2).toBe(true);
    });
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(0);
});

test("put and overide same messageId but different topic and get", () => {
    const store = new UniqueTopicStore();
    const packet = {
        topic: "hello",
        messageId: 42,
    };
    const packet2 = {
        topic: "world",
        messageId: 42,
    };

    store.put(packet);
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(1);
    store.put(packet2);
    store.get({ messageId: 42 }, (err: any, p: any) => {
        expect(p === packet2).toBe(true);
    });
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(1);
});

test("put and stream", (done) => {
    const store = new UniqueTopicStore();
    const packet = {
        topic: "hello",
        messageId: 42,
    };

    const testFn = jest.fn().mockImplementation((data) => {
        expect(data === packet).toBe(true);
    });

    store.put(packet, () => {
        const stream = store.createStream();
        stream.on("data", testFn);
        stream.on("close", () => {
            expect(testFn).toBeCalledTimes(1);
            done();
        });
    });
});

test("destroy stream", (done) => {
    const store = new UniqueTopicStore();
    const packet = {
        topic: "hello",
        messageId: 42,
    };

    store.put(packet, () => {
        const stream = store.createStream();
        stream.on("close", () => {
            done();
        });
        stream.destroy();
    });
});

test("delete package without topic", () => {
    const store = new UniqueTopicStore();
    const packet = {
        messageId: 42,
    };

    store.put(packet);
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(0);
    store.del({ messageId: 42 }, (err: any, p: any) => {
        expect(p === packet).toBe(true);
        expect((store as any)._inflights.size).toBe(0);
        expect((store as any)._reverseMap.size).toBe(0);
    });
});

test("delete package with topic", () => {
    const store = new UniqueTopicStore();
    const packet = {
        topic: "Hello",
        messageId: 42,
    };

    store.put(packet);
    expect((store as any)._inflights.size).toBe(1);
    expect((store as any)._reverseMap.size).toBe(1);
    store.del({ messageId: 42 }, (err: any, p: any) => {
        expect(p === packet).toBe(true);
        expect((store as any)._inflights.size).toBe(0);
        expect((store as any)._reverseMap.size).toBe(0);
    });
});
