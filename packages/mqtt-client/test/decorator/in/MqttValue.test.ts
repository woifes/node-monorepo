// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tJsVal } from "@woifes/binarytypes";
import * as rt from "runtypes";
import { Message } from "../../../src/Message";
import { VALUE_LIST_KEY } from "../../../src/decorator/constants";
import { MqttValue } from "../../../src/decorator/in/MqttValue";
import { tMqttValueConfig } from "../../../src/decorator/types/MqttValueConfig";
/*
{
    topic: string,
    type: TypeName | "STRING" | "JSON",
    qos?: QoS,
    minQos?: QoS,
    throttleMS?: number,
    fallBackValue?: any,
    runtype?: Runtype
}
*/

describe("property decorator test", () => {
    it("should add property to value list", () => {
        class TestClass {
            @MqttValue({
                topic: "A/B/C",
                type: "UINT8",
            })
            public theProperty = 0;
        }
        const t = new TestClass();
        const list = (t as any)[VALUE_LIST_KEY] as Map<
            (msg: tJsVal) => void,
            () => tMqttValueConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(123);
            expect(config.call(t).topic).toBe("A/B/C");
            expect(config.call(t).type).toBe("UINT8");
        }
        expect(t.theProperty).toBe(123);
    });

    it("should add property to value list dynamic config", () => {
        class TestClass {
            private _topic = "AA/BB/CC";
            static getConfig(this: TestClass): tMqttValueConfig {
                return {
                    topic: this._topic,
                    type: "UINT8",
                    qos: 1,
                };
            }

            @MqttValue(TestClass.getConfig)
            public theProperty = 0;
        }
        const t = new TestClass();
        const list = (t as any)[VALUE_LIST_KEY] as Map<
            (msg: tJsVal) => void,
            () => tMqttValueConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(123);
            expect(config.call(t).topic).toBe("AA/BB/CC");
            expect(config.call(t).type).toBe("UINT8");
            expect(config.call(t).qos).toBe(1);
        }
        expect(t.theProperty).toBe(123);
    });
});

describe("setter decorator test", () => {
    it("should add setter to value list list", () => {
        class TestClass {
            public test: jest.Mock = jest.fn();

            @MqttValue({
                topic: "A/B/C",
                qos: 1,
                type: "UINT32",
                minQos: 1,
            })
            set aMsg(val: tJsVal) {
                this.test(val);
            }
        }
        const t = new TestClass();
        const list = (t as any)[VALUE_LIST_KEY] as Map<
            (msg: tJsVal) => void,
            () => tMqttValueConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(12345);
            expect(config.call(t).qos).toBe(1);
            expect(config.call(t).minQos).toBe(1);
            expect(config.call(t).topic).toBe("A/B/C");
            expect(config.call(t).type).toBe("UINT32");
        }
        expect(t.test).toBeCalledTimes(1);
        const n = t.test.mock.calls[0][0];
        expect(n).toBe(12345);
    });

    it("should add setter to value list dynamic config", () => {
        class TestClass {
            static getConfig(this: TestClass): tMqttValueConfig {
                return {
                    topic: this._topic,
                    type: "UINT8",
                    throttleMS: 300,
                };
            }

            public test: jest.Mock = jest.fn();
            private _topic = "A/B/C";

            @MqttValue(TestClass.getConfig)
            set aMsg(val: tJsVal) {
                this.test(val);
            }
        }
        const t = new TestClass();
        const m = new Message("A/B/C", 1, false, "Hello");
        const list = (t as any)[VALUE_LIST_KEY] as Map<
            (msg: tJsVal) => void,
            () => tMqttValueConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(123);
            expect(config.call(t).throttleMS).toBe(300);
            expect(config.call(t).topic).toBe("A/B/C");
            expect(config.call(t).type).toBe("UINT8");
        }
        expect(t.test).toBeCalledWith(123);
    });
});

describe("method decorator test", () => {
    it("should add method to value list list", () => {
        class TestClass {
            public test: jest.Mock = jest.fn();

            @MqttValue({
                topic: "A/B/C",
                type: "UINT16",
                fallBackValue: 456,
            })
            aMethod(val: tJsVal) {
                this.test(val);
            }
        }

        const t = new TestClass();
        const list = (t as any)[VALUE_LIST_KEY] as Map<
            (msg: tJsVal) => void,
            () => tMqttValueConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(123);
            expect(config.call(t).fallBackValue).toBe(456);
            expect(config.call(t).topic).toBe("A/B/C");
            expect(config.call(t).type).toBe("UINT16");
        }
        expect(t.test).toBeCalledWith(123);
    });

    it("should add method to value list dynamic config", () => {
        class TestClass {
            public test: jest.Mock = jest.fn();

            @MqttValue({
                topic: "A/B/C",
                type: "UINT16",
                runtype: rt.Number,
            })
            aMethod(val: tJsVal) {
                this.test(val);
            }
        }

        const t = new TestClass();
        const list = (t as any)[VALUE_LIST_KEY] as Map<
            (msg: tJsVal) => void,
            () => tMqttValueConfig
        >;
        for (const [fn, config] of list) {
            fn.bind(t)(123);
            expect(config.call(t).runtype).toBe(rt.Number);
            expect(config.call(t).topic).toBe("A/B/C");
            expect(config.call(t).type).toBe("UINT16");
        }
        expect(t.test).toBeCalledWith(123);
    });
});
