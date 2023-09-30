// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Message } from "../../../src/Message";
import { CMD_HANDLER_LIST_KEY } from "../../../src/decorator/constants";
import { MqttCmdHandler } from "../../../src/decorator/in/MqttCmdHandler";
import { tMqttCmdHandlerConfig } from "../../../src/decorator/types/MqttCmdHandlerConfig";
/*
{
    topic: string,
    qos?: QoS,
    minQos?: QoS;
    throttleMS?: number;
    topicTransform?: (request: string[]) => string[];
}
*/
describe("method decorator test", () => {
    it("should add method to the handler list", () => {
        class TestClass {
            public test: jest.Mock = jest.fn();

            @MqttCmdHandler({
                topic: "cmd/you/me/doit",
                qos: 2,
                minQos: 2,
            })
            aMethod(msg: Message, res: Message) {
                this.test(msg, res);
            }
        }
        const t = new TestClass();
        const m1 = new Message("cmd/you/me/doit", 1, false, "Hello");
        const m2 = new Message("cmdRes/me/you/doit", 1, false, "Hello");
        const list = (t as any)[CMD_HANDLER_LIST_KEY] as Map<
            (msg: Message, res: Message) => void,
            () => tMqttCmdHandlerConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(m1, m2);
            expect(config.call(t).qos).toBe(2);
            expect(config.call(t).minQos).toBe(2);
            expect(config.call(t).topic).toBe("cmd/you/me/doit");
        }
        expect(t.test).toBeCalledTimes(1);
        const [msg, mRes]: Message[] = t.test.mock.calls[0];
        expect(msg === m1).toBe(true);
        expect(mRes === m2).toBe(true);
    });

    it("should add method to the handler list dynamic config", () => {
        class TestClass {
            private _internTopic = "cmd/you/me/intcmd";
            static getConfig(this: TestClass): tMqttCmdHandlerConfig {
                return {
                    topic: this._internTopic,
                    throttleMS: 300,
                };
            }
            public test: jest.Mock = jest.fn();

            @MqttCmdHandler(TestClass.getConfig)
            aMethod(msg: Message, res: Message) {
                this.test(msg, res);
            }
        }
        const t = new TestClass();
        const m1 = new Message("cmd/you/me/intcmd", 1, false, "Hello");
        const m2 = new Message("cmdRes/me/you/intcmd", 1, false, "Hello");
        const list = (t as any)[CMD_HANDLER_LIST_KEY] as Map<
            (msg: Message, res: Message) => void,
            () => tMqttCmdHandlerConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(m1, m2);
            expect(config.call(t).throttleMS).toBe(300);
            expect(config.call(t).topic).toBe("cmd/you/me/intcmd");
        }
        expect(t.test).toBeCalledTimes(1);
        const [msg, mRes]: Message[] = t.test.mock.calls[0];
        expect(msg === m1).toBe(true);
        expect(mRes === m2).toBe(true);
    });
});

it("should throw if set on setter", () => {
    expect(() => {
        class TestClass {
            private _internTopic = "cmd/you/me/intcmd";
            static getConfig(this: TestClass): tMqttCmdHandlerConfig {
                return {
                    topic: this._internTopic,
                    throttleMS: 300,
                };
            }
            public test: jest.Mock = jest.fn();

            @MqttCmdHandler(TestClass.getConfig)
            set cmd(msg: Message) {
                this.test(msg);
            }
        }
    }).toThrow();
});
