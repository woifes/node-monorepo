// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { connect } from "mqtt";
import { MqttClientMock } from "../__mocks__/mqtt";
import { Client } from "../src/Client";
import { Message } from "../src/Message";
import { TopicMap } from "../src/utils/TopicMap";
const CONNECT = connect as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    jest.useRealTimers();
});

describe("creation tests", () => {
    it("should wait to connect when no credentials are set", () => {
        const config = {
            url: "url01",
            clientId: "id01",
            caCertificate: "cert",
        };
        const c = new Client(config);
        expect(CONNECT).toBeCalledTimes(0);
        c.connectToBroker("usermanual", "passmanual");
        expect(CONNECT).toBeCalledTimes(1);
        const [url, mqttConfig] = CONNECT.mock.calls[0];
        expect(url).toBe("url01");
        expect(mqttConfig.clientId).toBe("id01");
        expect(mqttConfig.username).toBe("usermanual");
        expect(mqttConfig.password).toBe("passmanual");
        expect(mqttConfig.will).toBeUndefined();
        expect(mqttConfig.ca.toString("utf-8")).toBe("cert");
    });

    it("should get credentials direct from config", () => {
        const config = {
            url: "url03",
            clientId: "id03",
            auth: {
                username: "user03",
                password: "pw",
            },
            caCertificate: "cert",
        };
        const c = new Client(config);
        expect(CONNECT).toBeCalledTimes(1);
        const [url, mqttConfig] = CONNECT.mock.calls[0];
        expect(url).toBe("url03");
        expect(mqttConfig.clientId).toBe("id03");
        expect(mqttConfig.username).toBe("user03");
        expect(mqttConfig.password).toBe("pw");
        expect(mqttConfig.will).toBeUndefined();
        expect(mqttConfig.ca.toString("utf-8")).toBe("cert");
    });

    it("should send notify message and set will if configured", () => {
        const config = {
            url: "url04",
            clientId: "id04",
            auth: {
                username: "user04",
                password: "pw",
            },
            caCertificate: "cert",
            notifyPresencePrefix: "clients",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        mqttClient.connected = true;
        expect(CONNECT).toBeCalledTimes(1);
        const [url, mqttConfig] = CONNECT.mock.calls[0];
        expect(url).toBe("url04");
        expect(mqttConfig.clientId).toBe("id04");
        expect(mqttConfig.username).toBe("user04");
        expect(mqttConfig.password).toBe("pw");
        expect(mqttConfig.will).toEqual({
            topic: "clients/id04",
            payload: "0",
            qos: 2,
            retain: true,
        });
        expect(mqttConfig.ca.toString("utf-8")).toBe("cert");
        expect(mqttClient.publish).toBeCalledTimes(1);
        const [topic, payload, publishOpts, cb] =
            mqttClient.publish.mock.calls[0];
        expect(topic).toBe("clients/id04");
        expect(payload).toBe("1");
        expect(publishOpts.qos).toBe(2);
        expect(publishOpts.retain).toBe(true);
    });
});

describe("publish value tests", () => {
    const config = {
        url: "url03",
        clientId: "id03",
        auth: {
            username: "user01",
            password: "pw",
        },
        caCertificate: "cert",
    };
    const c = new Client(config);
    const mqttClient = (c as any)._mqttClient as MqttClientMock;

    it("should publish valid json message", () => {
        c.publishValueSync("A/B/C", { a: 1, b: 2, c: 3 }, "JSON", 1, true);
        expect(mqttClient.publish).toBeCalledTimes(1);
        const [topic, payload, publishOpts, cb] =
            mqttClient.publish.mock.calls[0];
        expect(topic).toBe("A/B/C");
        expect(payload).toBe(`{"a":1,"b":2,"c":3}`);
        expect(publishOpts.qos).toBe(1);
        expect(publishOpts.retain).toBe(true);
    });

    it("should publish valid string message", () => {
        c.publishValueSync("A/B/C", "Hello World", "STRING", 2, false);
        expect(mqttClient.publish).toBeCalledTimes(1);
        const [topic, payload, publishOpts, cb] =
            mqttClient.publish.mock.calls[0];
        expect(topic).toBe("A/B/C");
        expect(payload).toBe("Hello World");
        expect(publishOpts.qos).toBe(2);
        expect(publishOpts.retain).toBe(false);
    });

    it("should publish valid value message", () => {
        c.publishValueSync(
            "A/B/C",
            [1.2, 3.4, 5.6],
            "ARRAY_OF_DOUBLE",
            0,
            false,
        );
        expect(mqttClient.publish).toBeCalledTimes(1);
        const [topic, payload, publishOpts, cb] =
            mqttClient.publish.mock.calls[0];
        expect(topic).toBe("A/B/C");
        expect(payload).toBe("[1.2,3.4,5.6]");
        expect(publishOpts.qos).toBe(0);
        expect(publishOpts.retain).toBe(false);
    });
});

describe("do not publish invalid value tests", () => {
    const config = {
        url: "url03",
        clientId: "id03",
        auth: {
            username: "user01",
            password: "pw",
        },
        caCertificate: "cert",
    };
    const c = new Client(config);
    const mqttClient = (c as any)._mqttClient as MqttClientMock;

    it("should not publish invalid json message", () => {
        c.publishValueSync("A/B/C", { a: 1n, b: 2n, c: 3n }, "JSON", 1, true);
        expect(mqttClient.publish).toBeCalledTimes(0);
    });

    //it("should publish valid string message", ()=>{
    //    expect(c.publishValue("A/B/C", "Hello World", "STRING", 2, false)).toBe(false);
    //    expect(MQTT_CLIENT.publish).toBeCalledTimes(1);
    //}); Nodejs can stringify everthing

    it("should publish valid value message", () => {
        c.publishValueSync("A/B/C", "no array", "ARRAY_OF_DOUBLE", 0, false);
        expect(mqttClient.publish).toBeCalledTimes(0);
    });
});

describe("publish message tests", () => {
    const config = {
        url: "url03",
        clientId: "id03",
        auth: {
            username: "user01",
            password: "pw",
        },
        caCertificate: "cert",
    };
    const c = new Client(config);
    const mqttClient = (c as any)._mqttClient as MqttClientMock;

    it("should publish valid message", () => {
        const m = new Message("A/B/C", 1, false, "Hello World");

        expect(c.publishMessage(m)).resolves.toBeUndefined();

        expect(mqttClient.publish).toBeCalledTimes(1);
        const [topic, payload, publishOpts, cb] =
            mqttClient.publish.mock.calls[0];
        expect(topic).toBe("A/B/C");
        expect(payload).toBe("Hello World");
        expect(publishOpts.qos).toBe(1);
        expect(publishOpts.retain).toBe(false);
    });

    it("should not publish empty message", () => {
        const m = new Message("A/B/C", 2, true);

        expect(c.publishMessage(m)).rejects.toBeTruthy();

        expect(mqttClient.publish).toBeCalledTimes(0);
    });

    it("should not publish message with wrong topic", () => {
        const m1 = new Message("A/B/C", 0, false);
        const m2 = new Message("A/+/C", 1, false);
        const m3 = new Message("A/+abc/C", 1, false);
        const m4 = new Message("A/B/#", 2, false);
        const m5 = new Message("A/B/#abc", 2, false);
        const m6 = new Message("A/B/#", 0, false);
        const m7 = new Message("/A/B/C", 1, false);
        const m8 = new Message("A//C", 2, false);

        expect(c.publishMessage(m1)).rejects.toBeTruthy();
        expect(c.publishMessage(m2)).rejects.toBeTruthy();
        expect(c.publishMessage(m3)).rejects.toBeTruthy();
        expect(c.publishMessage(m4)).rejects.toBeTruthy();
        expect(c.publishMessage(m5)).rejects.toBeTruthy();
        expect(c.publishMessage(m6)).rejects.toBeTruthy();
        expect(c.publishMessage(m7)).rejects.toBeTruthy();
        expect(c.publishMessage(m8)).rejects.toBeTruthy();

        expect(mqttClient.publish).toBeCalledTimes(0);
    });

    it("should hand over mqtt publish error", () => {
        const m = new Message("A/B/C", 2, true, "Hello World");

        mqttClient.publish.mockImplementationOnce(
            (
                t: string,
                p: string,
                pO: { qos: number; retain: boolean },
                //biome-ignore lint/complexity/noBannedTypes: needed
                cb: Function,
            ) => cb(new Error("MQTT error")),
        );

        expect(c.publishMessage(m)).rejects.toBeTruthy();

        expect(mqttClient.publish).toBeCalledTimes(1);
        const [topic, payload, publishOpts, cb] =
            mqttClient.publish.mock.calls[0];
        expect(topic).toBe("A/B/C");
        expect(payload).toBe("Hello World");
        expect(publishOpts.qos).toBe(2);
        expect(publishOpts.retain).toBe(true);
    });
});

describe("subscribe tests", () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const cb3 = jest.fn();

    it("should send subscribe and unsubscribe immediately when connected", () => {
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        mqttClient._connected = true;

        const sub1 = c.mqttSubscribe("A/B/C", 0).subscribe(cb1);
        expect(mqttClient.subscribe).toBeCalledTimes(1);
        let [topic, opts, cb] = mqttClient.subscribe.mock.calls[0];
        expect(topic).toBe("A/B/C");
        expect(opts).toEqual({ qos: 0 });

        const sub2 = c.mqttSubscribe("A/B/C", 1).subscribe(cb2);
        expect(mqttClient.subscribe).toBeCalledTimes(2);
        [topic, opts, cb] = mqttClient.subscribe.mock.calls[1];
        expect(topic).toBe("A/B/C");
        expect(opts).toEqual({ qos: 1 });

        const sub3 = c.mqttSubscribe("A/B/C", 2).subscribe(cb3);
        expect(mqttClient.subscribe).toBeCalledTimes(3);
        [topic, opts, cb] = mqttClient.subscribe.mock.calls[2];
        expect(topic).toBe("A/B/C");
        expect(opts).toEqual({ qos: 2 });

        sub3.unsubscribe();
        expect(mqttClient.unsubscribe).toBeCalledTimes(0);
        sub2.unsubscribe();
        expect(mqttClient.unsubscribe).toBeCalledTimes(0);
        sub1.unsubscribe();
        expect(mqttClient.unsubscribe).toBeCalledTimes(1);
        [topic, cb] = mqttClient.unsubscribe.mock.calls[0];
        expect(topic).toBe("A/B/C");
    });

    it("should send subscribe as soon as connected", () => {
        const config = {
            url: "url02",
            clientId: "id02",
            caCertificate: "cert",
        };
        const c = new Client(config);

        const sub1 = c.mqttSubscribe("A/B/C", 0).subscribe(cb1);
        //expect(mqttClient.subscribe).toBeCalledTimes(0);
        const sub2 = c.mqttSubscribe("A/B/C", 1).subscribe(cb2);
        //expect(mqttClient.subscribe).toBeCalledTimes(0);
        const sub3 = c.mqttSubscribe("A/B/C", 2).subscribe(cb3);
        //expect(mqttClient.subscribe).toBeCalledTimes(0);

        c.connectToBroker("user01", "123");
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        mqttClient.connected = true;

        expect(mqttClient.subscribe).toBeCalledTimes(1);
        const [topic, opts, cb] = mqttClient.subscribe.mock.calls[0];
        expect(topic).toBe("A/B/C");
        expect(opts).toEqual({ qos: 2 });
    });

    it("should not send subscribe if no handler is there while connecting", () => {
        const config = {
            url: "url03",
            clientId: "id03",
            caCertificate: "cert",
        };
        const c = new Client(config);

        const sub1 = c.mqttSubscribe("A/B/C", 0).subscribe(cb1);
        //expect(mqttClient.subscribe).toBeCalledTimes(0);
        const sub2 = c.mqttSubscribe("A/B/C", 1).subscribe(cb2);
        //expect(mqttClient.subscribe).toBeCalledTimes(0);
        let sub3 = c.mqttSubscribe("A/B/C", 2).subscribe(cb3);
        //expect(mqttClient.subscribe).toBeCalledTimes(0);

        sub3.unsubscribe();
        //expect(mqttClient.unsubscribe).toBeCalledTimes(0);
        sub2.unsubscribe();
        //expect(mqttClient.unsubscribe).toBeCalledTimes(0);
        sub1.unsubscribe();
        //expect(mqttClient.unsubscribe).toBeCalledTimes(0);

        c.connectToBroker("user01", "123");
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        mqttClient.connected = true;

        expect(mqttClient.subscribe).toBeCalledTimes(0);

        sub3 = c.mqttSubscribe("A/B/C", 2).subscribe(cb3);
        expect(mqttClient.subscribe).toBeCalledTimes(1);
    });
});

describe("subscribe observable test", () => {
    it("should set callback message when subscribe to observable", () => {
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        mqttClient._connected = true;
        const obs = c.mqttSubscribe("A/B/C", 0);
        expect(mqttClient.subscribe).not.toBeCalled();
        const cb1 = jest.fn();
        const sub = obs.subscribe(cb1);
        expect(mqttClient.subscribe).toBeCalledTimes(1);
        expect(mqttClient.unsubscribe).not.toBeCalled();
        sub.unsubscribe();
        expect(mqttClient.unsubscribe).toBeCalledTimes(1);
    });

    it("should distribute message via observable", () => {
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const m = new Message("A/B/C", 0, false, "Hello World");
        const cb1 = jest.fn();
        const cb2 = jest.fn();
        const cb3 = jest.fn();
        const cb4 = jest.fn();
        const sub1 = c.mqttSubscribe("A/B/C", 0).subscribe(cb1);
        const sub2 = c.mqttSubscribe("A/+/C", 1).subscribe(cb2);
        const sub3 = c.mqttSubscribe("A/#", 2).subscribe(cb3);
        const sub4 = c.mqttSubscribe("B/C/D", 2).subscribe(cb4);
        mqttClient.emitMessage(m);
        expect(cb1).toBeCalledTimes(1);
        expect(cb2).toBeCalledTimes(1);
        expect(cb3).toBeCalledTimes(1);
        expect(cb4).toBeCalledTimes(0);
        const m1 = cb1.mock.calls[0][0];
        const m2 = cb2.mock.calls[0][0];
        const m3 = cb3.mock.calls[0][0];

        expect(m1.topic).toEqual(m.topic);
        expect(m1.qos).toEqual(m.qos);
        expect(m1.retain).toEqual(m.retain);
        expect(m1.client).toEqual(c);

        expect(m1 === m2).toBe(false);
        expect(m2 === m3).toBe(false);
        expect(m3 === m1).toBe(false);
        expect(m1.topic).toEqual(m2.topic);
        expect(m2.topic).toEqual(m3.topic);
        expect(m1.qos).toBe(m2.qos);
        expect(m2.qos).toBe(m3.qos);
        expect(m1.retain).toBe(m2.retain);
        expect(m2.retain).toBe(m3.retain);
        expect(m1.client).toBe(m2.client);
        expect(m2.client).toBe(m3.client);
    });

    it("should no more distribute if unsubscribed", () => {
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const m = new Message("A/B/C", 0, false, "Hello World");
        const cb1 = jest.fn();
        const sub1 = c.mqttSubscribe("A/B/C", 0).subscribe(cb1);
        mqttClient.emitMessage(m);
        expect(cb1).toBeCalledTimes(1);
        sub1.unsubscribe();
        mqttClient.emitMessage(m);
        expect(cb1).toBeCalledTimes(1);
    });
});

describe("distribute message test", () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const cb3 = jest.fn();

    it("should distribute message to each handler", () => {
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const m = new Message("A/B/C", 0, false, "Hello World");
        c.mqttSubscribe("A/B/C", 0).subscribe(cb1);
        c.mqttSubscribe("A/+/C", 1).subscribe(cb2);
        c.mqttSubscribe("A/#", 2).subscribe(cb3);
        mqttClient.emitMessage(m);
        expect(cb1).toBeCalledTimes(1);
        expect(cb2).toBeCalledTimes(1);
        expect(cb3).toBeCalledTimes(1);
        const m1 = cb1.mock.calls[0][0];
        const m2 = cb2.mock.calls[0][0];
        const m3 = cb3.mock.calls[0][0];

        expect(m1.topic).toEqual(m.topic);
        expect(m1.qos).toEqual(m.qos);
        expect(m1.retain).toEqual(m.retain);
        expect(m1.client).toEqual(c);

        expect(m1 === m2).toBe(false);
        expect(m2 === m3).toBe(false);
        expect(m3 === m1).toBe(false);
        expect(m1.topic).toEqual(m2.topic);
        expect(m2.topic).toEqual(m3.topic);
        expect(m1.qos).toBe(m2.qos);
        expect(m2.qos).toBe(m3.qos);
        expect(m1.retain).toBe(m2.retain);
        expect(m2.retain).toBe(m3.retain);
        expect(m1.client).toBe(m2.client);
        expect(m2.client).toBe(m3.client);
    });

    it("should use message cache when configured", () => {
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            caCertificate: "cert",
            messageCacheTimeS: 0,
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const m = new Message("A/B/C", 0, false, "Hello World");
        c.mqttSubscribe("A/B/C", 2).subscribe(cb1);
        mqttClient.emitMessage(m);
        expect(cb1).toBeCalledTimes(1);
        c.mqttSubscribe("A/+/C", 2).subscribe(cb2);
        expect(cb2).toBeCalledTimes(1);
    });

    it("should not use message cache when not configured", () => {
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const m = new Message("A/B/C", 0, false, "Hello World");
        c.mqttSubscribe("A/B/C", 2).subscribe(cb1);
        mqttClient.emitMessage(m);
        expect(cb1).toBeCalledTimes(1);
        c.mqttSubscribe("A/+/C", 2).subscribe(cb2);
        expect(cb2).toBeCalledTimes(0);
    });
});

describe("cache tests", () => {
    function countCacheMessages(map: TopicMap<Message>): number {
        let n = 0;
        for (const msg of map.allValues()) {
            n++;
        }
        return n;
    }

    it("should store and cleanup cache", () => {
        jest.useFakeTimers();
        let dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => 1000);
        const cacheTime = 5;
        const cb1 = jest.fn();
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            messageCacheTimeS: cacheTime,
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const cache = (c as any)._messageCache as TopicMap<Message>;
        const m1 = new Message("A/B/C", 0, false, "payload01");
        let m2 = new Message("A/B/E", 0, false, "payload02");
        let m3 = new Message("A/B/F", 0, false, "payload03");
        c.mqttSubscribe("#", 0).subscribe(cb1);
        mqttClient.emitMessage(m1);
        mqttClient.emitMessage(m2);
        mqttClient.emitMessage(m3);
        expect(countCacheMessages(cache)).toBe(3);
        dateNowSpy = jest
            .spyOn(Date, "now")
            .mockImplementationOnce(() => 1000 + 2 * cacheTime * 1000);
        jest.runOnlyPendingTimers();
        expect(countCacheMessages(cache)).toBe(0);

        m2 = new Message("A/B/E", 0, false, "payload02");
        m3 = new Message("A/B/F", 0, false, "payload03");
        mqttClient.emitMessage(m1);
        dateNowSpy = jest
            .spyOn(Date, "now")
            .mockImplementation(() => 1000 + 2 * cacheTime * 1000);
        mqttClient.emitMessage(m2);
        mqttClient.emitMessage(m3);
        expect(countCacheMessages(cache)).toBe(3);
        jest.runOnlyPendingTimers();
        expect(countCacheMessages(cache)).toBe(2);
    });

    it("should override same topic", () => {
        jest.useFakeTimers();
        const cb1 = jest.fn();
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            messageCacheTimeS: 0,
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const cache = (c as any)._messageCache as TopicMap<Message>;
        const m1 = new Message("A/B/C", 0, false, "payload01");
        const m2 = new Message("A/B/C", 0, false, "payload02");
        const m3 = new Message("A/B/F", 0, false, "payload03");
        c.mqttSubscribe("#", 0).subscribe(cb1);
        mqttClient.emitMessage(m1);
        mqttClient.emitMessage(m2);
        mqttClient.emitMessage(m3);
        expect(countCacheMessages(cache)).toBe(2);
    });

    it("should not store message in cache if no subscriber present", () => {
        jest.useFakeTimers();
        const cb1 = jest.fn();
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            messageCacheTimeS: 5,
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const cache = (c as any)._messageCache as TopicMap<Message>;
        const m1 = new Message("A/B/C", 0, false, "payload01");
        const m2 = new Message("A/B/E", 0, false, "payload02");
        const m3 = new Message("A/B/F", 0, false, "payload03");
        //c.subscribe("#", 0, cb1);
        mqttClient.emitMessage(m1);
        mqttClient.emitMessage(m2);
        mqttClient.emitMessage(m3);
        expect(countCacheMessages(cache)).toBe(0);
        //jest.runOnlyPendingTimers();
    });

    it("should store message forever when cache time is set to 0", () => {
        jest.useFakeTimers();
        let dateNowSpy = jest.spyOn(Date, "now").mockImplementation(() => 1000);
        const cacheTime = 5;
        const cb1 = jest.fn();
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            messageCacheTimeS: 0,
            caCertificate: "cert",
        };
        const c = new Client(config);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const cache = (c as any)._messageCache as TopicMap<Message>;
        const m1 = new Message("A/B/C", 0, false, "payload01");
        const m2 = new Message("A/B/E", 0, false, "payload02");
        const m3 = new Message("A/B/F", 0, false, "payload03");
        c.mqttSubscribe("#", 0).subscribe(cb1);
        mqttClient.emitMessage(m1);
        mqttClient.emitMessage(m2);
        mqttClient.emitMessage(m3);
        expect(countCacheMessages(cache)).toBe(3);
        dateNowSpy = jest
            .spyOn(Date, "now")
            .mockImplementation(() => 1000 + 2 * cacheTime * 1000);
        jest.runOnlyPendingTimers();
        expect(countCacheMessages(cache)).toBe(3);
    });
});

describe("external onConnectionHandler tests", () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const cb3 = jest.fn();

    it("should call each on connection handler", () => {
        const config = {
            url: "url01",
            clientId: "id01",
            auth: {
                username: "user01",
                password: "pw",
            },
            caCertificate: "cert",
        };
        const c = new Client(config);

        const sub1 = c.connectionState().subscribe(cb1);
        const sub2 = c.connectionState().subscribe(cb2);
        const sub3 = c.connectionState().subscribe(cb3);
        expect((c as any)._extOnConnectionHandler.length).toBe(3);
        expect(cb1).toBeCalledTimes(1);
        expect(cb1.mock.calls[0][0]).toBe(false);
        expect(cb2).toBeCalledTimes(1);
        expect(cb2.mock.calls[0][0]).toBe(false);
        expect(cb2).toBeCalledTimes(1);
        expect(cb2.mock.calls[0][0]).toBe(false);

        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        mqttClient.connected = true;
        expect(cb1).toBeCalledTimes(2);
        expect(cb1.mock.calls[1][0]).toBe(true);
        expect(cb2).toBeCalledTimes(2);
        expect(cb2.mock.calls[1][0]).toBe(true);
        expect(cb3).toBeCalledTimes(2);
        expect(cb3.mock.calls[1][0]).toBe(true);

        mqttClient.connected = false;

        expect(cb1).toBeCalledTimes(3);
        expect(cb1.mock.calls[2][0]).toBe(false);
        expect(cb2).toBeCalledTimes(3);
        expect(cb2.mock.calls[2][0]).toBe(false);
        expect(cb3).toBeCalledTimes(3);
        expect(cb3.mock.calls[2][0]).toBe(false);

        jest.clearAllMocks();

        sub2.unsubscribe();
        expect((c as any)._extOnConnectionHandler.length).toBe(2);
        mqttClient.connected = true;

        expect(cb1).toBeCalledTimes(1);
        expect(cb2).not.toBeCalled();
        expect(cb3).toBeCalledTimes(1);
    });
});
