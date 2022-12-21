// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { MSG_HANDLER_LIST_KEY } from "../../../src/decorator/constants";
import { MqttMsgHandler } from "../../../src/decorator/in/MqttMsgHandler";
import { tMqttMsgHandlerConfig } from "../../../src/decorator/types/MqttMsgHandlerConfig";
import { Message } from "../../../src/Message";
/*
{
    topic: string,
    qos?: QoS,
    minQos?: QoS;
    throttleMS?: number;
}
*/
describe("setter decorator test", () => {
    it("should add setter to the handler list", () => {
        class TestClass {
            public test: jest.Mock = jest.fn();

            constructor() {}

            @MqttMsgHandler({
                topic: "A/B/C",
            })
            set aMsg(msg: Message) {
                this.test(msg);
            }
        }
        const t = new TestClass();
        const m = new Message("A/B/C", 2, false, "Hello");
        const list = (t as any)[MSG_HANDLER_LIST_KEY] as Map<
            (msg: Message) => void,
            () => tMqttMsgHandlerConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(m);
            expect(config.call(t).topic).toBe("A/B/C");
        }
        expect(t.test).toBeCalledTimes(1);
        const m1 = t.test.mock.calls[0][0];
        expect(m === m1).toBe(true);
    });

    it("should add setter to the handler list dynamic config", () => {
        class TestClass {
            private _internTopic = "AA/BB/CC";
            static getConfig(this: TestClass): tMqttMsgHandlerConfig {
                return {
                    topic: this._internTopic,
                    qos: 2,
                };
            }
            public test: jest.Mock = jest.fn();

            constructor() {}

            @MqttMsgHandler(TestClass.getConfig)
            set aMsg(msg: Message) {
                this.test(msg);
            }
        }
        const t = new TestClass();
        const m = new Message("AA/BB/CC", 2, false, "Hello");
        const list = (t as any)[MSG_HANDLER_LIST_KEY] as Map<
            (msg: Message) => void,
            () => tMqttMsgHandlerConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(m);
            expect(config.call(t).qos).toBe(2);
            expect(config.call(t).topic).toBe("AA/BB/CC");
        }
        expect(t.test).toBeCalledTimes(1);
        const m1 = t.test.mock.calls[0][0];
        expect(m === m1).toBe(true);
    });
});

describe("method decorator test", () => {
    it("should add method to the handler list", () => {
        class TestClass {
            public test: jest.Mock = jest.fn();

            constructor() {}

            @MqttMsgHandler({
                topic: "A/B/C",
                qos: 1,
                minQos: 1,
            })
            aMethod(msg: Message) {
                this.test(msg);
            }
        }
        const t = new TestClass();
        const m = new Message("A/B/C", 1, false, "Hello");
        const list = (t as any)[MSG_HANDLER_LIST_KEY] as Map<
            (msg: Message) => void,
            () => tMqttMsgHandlerConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(m);
            expect(config.call(t).qos).toBe(1);
            expect(config.call(t).minQos).toBe(1);
            expect(config.call(t).topic).toBe("A/B/C");
        }
        expect(t.test).toBeCalledTimes(1);
        const m1 = t.test.mock.calls[0][0];
        expect(m === m1).toBe(true);
    });

    it("should add method to the handler list dynamic config", () => {
        class TestClass {
            private _internTopic = "AA/BB/CC";
            static getConfig(this: TestClass): tMqttMsgHandlerConfig {
                return {
                    topic: this._internTopic,
                    throttleMS: 300,
                };
            }
            public test: jest.Mock = jest.fn();

            constructor() {}

            @MqttMsgHandler(TestClass.getConfig)
            set aMsg(msg: Message) {
                this.test(msg);
            }
        }
        const t = new TestClass();
        const m = new Message("AA/BB/CC", 2, false, "Hello");
        const list = (t as any)[MSG_HANDLER_LIST_KEY] as Map<
            (msg: Message) => void,
            () => tMqttMsgHandlerConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(m);
            expect(config.call(t).throttleMS).toBe(300);
            expect(config.call(t).topic).toBe("AA/BB/CC");
        }
        expect(t.test).toBeCalledTimes(1);
        const m1 = t.test.mock.calls[0][0];
        expect(m === m1).toBe(true);
    });
});
