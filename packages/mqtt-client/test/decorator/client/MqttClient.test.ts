// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

/* eslint-disable @typescript-eslint/ban-types */

import { tJsVal } from "@woifes/binarytypes";
import { QoS } from "mqtt";
import * as rt from "runtypes";
import { Client } from "../../../src/Client";
import { MqttClient } from "../../../src/decorator/client/MqttClient";
import { SUBSCRIPTION_LIST_KEY } from "../../../src/decorator/constants";
import { MqttCmdHandler } from "../../../src/decorator/in/MqttCmdHandler";
import { MqttMsgHandler } from "../../../src/decorator/in/MqttMsgHandler";
import { MqttValue } from "../../../src/decorator/in/MqttValue";
import { MqttConnection } from "../../../src/decorator/MqttConnection";
import { MqttConnectionHandler } from "../../../src/decorator/MqttConnectionHandler";
import { MqttUnsubHook } from "../../../src/decorator/MqttUnsubHook";
import { tMqttCmdHandlerConfig } from "../../../src/decorator/types/MqttCmdHandlerConfig";
import { tMqttMsgHandlerConfig } from "../../../src/decorator/types/MqttMsgHandlerConfig";
import { tMqttValueConfig } from "../../../src/decorator/types/MqttValueConfig";
import { Message } from "../../../src/Message";
import { MqttClientMock } from "../../../__mocks__/mqtt";
const config = {
    url: "url",
    clientId: "id",
    auth: {
        username: "user",
        password: "pw",
    },
};
async function promiseTimeout(ms: number) {
    return new Promise((resolve, rejects) => {
        setTimeout(resolve, ms);
    });
}

it("should delegate constructor args correctly", () => {
    @MqttClient()
    class TestClass {
        constructor(public a: number, public b: string, public c: Client) {}
    }
    const c = new Client(config);
    const t = new TestClass(123, "abc", c);
    expect(t.a).toBe(123);
    expect(t.b).toBe("abc");
    expect(t.c).toEqual(c);
});

describe("auto search for mqtt client", () => {
    it("should find client in the arguments of the constructor", () => {
        @MqttClient()
        class testClass1 {
            static getConfig1(this: testClass1): tMqttValueConfig {
                return {
                    topic: this._topic1,
                    type: "INT16",
                };
            }
            static getConfig2(this: testClass1): tMqttMsgHandlerConfig {
                return {
                    topic: this._topic2,
                };
            }

            private _topic1 = "A/B/C";
            private _topic2 = "+/+/+";

            public valSetterTester = jest.fn();
            public valMethodTester = jest.fn();
            public msgSetterTester = jest.fn();
            public msgMethodTester = jest.fn();

            @MqttValue(testClass1.getConfig1)
            public propVal = 0;

            constructor(c: Client) {}

            @MqttValue({
                topic: "A/B/+",
                type: "UINT8",
            })
            set valSetter(v: tJsVal) {
                this.valSetterTester(v);
            }

            @MqttValue({
                topic: "A/#",
                type: "INT8",
            })
            valMethod(v: tJsVal) {
                this.valMethodTester(v);
            }

            @MqttMsgHandler({ topic: "+/B/+" })
            set msgSetter(m: Message) {
                this.msgSetterTester(m);
            }

            @MqttMsgHandler(testClass1.getConfig2)
            msgMethod(m: Message) {
                this.msgMethodTester(m);
            }
        }
        const m = new Message("A/B/C", 1, false, "123");
        const c = new Client(config);
        const t = new testClass1(c);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        mqttClient.connected = true;
        expect(mqttClient.subscribe).toBeCalledTimes(5);
        mqttClient.emitMessage(m);

        expect(t.propVal).toBe(123);

        expect(t.valSetterTester).toBeCalledTimes(1);
        let val = t.valSetterTester.mock.calls[0][0];
        expect(val).toBe(123);

        expect(t.valMethodTester).toBeCalledTimes(1);
        val = t.valMethodTester.mock.calls[0][0];
        expect(val).toBe(123);

        expect(t.msgSetterTester).toBeCalledTimes(1);
        let m1 = t.msgSetterTester.mock.calls[0][0];
        expect(m1 instanceof Message).toBe(true);
        expect(m1.topic).toEqual(["A", "B", "C"]);
        expect(m1.qos).toBe(1);
        expect(m1.retain).toBe(false);
        expect(m1.body).toBe("123");

        expect(t.msgMethodTester).toBeCalledTimes(1);
        m1 = t.msgMethodTester.mock.calls[0][0];
        expect(m1 instanceof Message).toBe(true);
        expect(m1.topic).toEqual(["A", "B", "C"]);
        expect(m1.qos).toBe(1);
        expect(m1.retain).toBe(false);
        expect(m1.body).toBe("123");
    });

    it("should find the client in the properties of the class", () => {
        @MqttClient()
        class testClass1 {
            static getConfig1(this: testClass1): tMqttValueConfig {
                return {
                    topic: this._topic1,
                    type: "INT16",
                };
            }
            static getConfig2(this: testClass1): tMqttMsgHandlerConfig {
                return {
                    topic: this._topic2,
                };
            }

            private _topic1 = "A/B/C";
            private _topic2 = "+/+/+";

            public _myClient: Client = new Client(config);
            public valSetterTester = jest.fn();
            public valMethodTester = jest.fn();
            public msgSetterTester = jest.fn();
            public msgMethodTester = jest.fn();

            @MqttValue(testClass1.getConfig1)
            public propVal = 0;

            constructor() {}

            @MqttValue({
                topic: "A/B/+",
                type: "UINT8",
            })
            set valSetter(v: tJsVal) {
                this.valSetterTester(v);
            }

            @MqttValue({
                topic: "A/#",
                type: "INT8",
            })
            valMethod(v: tJsVal) {
                this.valMethodTester(v);
            }

            @MqttMsgHandler({
                topic: "+/B/+",
            })
            set msgSetter(m: Message) {
                this.msgSetterTester(m);
            }

            @MqttMsgHandler(testClass1.getConfig2)
            msgMethod(m: Message) {
                this.msgMethodTester(m);
            }
        }
        const m = new Message("A/B/C", 1, false, "123");
        const t = new testClass1();
        const mqttClient = ((t as any)._myClient as any)
            ._mqttClient as MqttClientMock;
        mqttClient.connected = true;
        expect(mqttClient.subscribe).toBeCalledTimes(5);
        mqttClient.emitMessage(m);

        expect(t.propVal).toBe(123);

        expect(t.valSetterTester).toBeCalledTimes(1);
        let val = t.valSetterTester.mock.calls[0][0];
        expect(val).toBe(123);

        expect(t.valMethodTester).toBeCalledTimes(1);
        val = t.valMethodTester.mock.calls[0][0];
        expect(val).toBe(123);

        expect(t.msgSetterTester).toBeCalledTimes(1);
        let m1 = t.msgSetterTester.mock.calls[0][0];
        expect(m1 instanceof Message).toBe(true);
        expect(m1.topic).toEqual(["A", "B", "C"]);
        expect(m1.qos).toBe(1);
        expect(m1.retain).toBe(false);
        expect(m1.body).toBe("123");

        expect(t.msgMethodTester).toBeCalledTimes(1);
        m1 = t.msgMethodTester.mock.calls[0][0];
        expect(m1 instanceof Message).toBe(true);
        expect(m1.topic).toEqual(["A", "B", "C"]);
        expect(m1.qos).toBe(1);
        expect(m1.retain).toBe(false);
        expect(m1.body).toBe("123");
    });

    it("should throw error when none of both ways find a client", () => {
        @MqttClient()
        class testClass1 {
            public valSetterTester = jest.fn();
            public valMethodTester = jest.fn();
            public msgSetterTester = jest.fn();
            public msgMethodTester = jest.fn();

            @MqttValue({
                topic: "A/B/C",
                type: "INT16",
            })
            public propVal = 0;

            constructor() {}

            @MqttValue({
                topic: "A/B/+",
                type: "UINT8",
            })
            set valSetter(v: tJsVal) {
                this.valSetterTester(v);
            }

            @MqttValue({
                topic: "A/#",
                type: "INT8",
            })
            valMethod(v: tJsVal) {
                this.valMethodTester(v);
            }

            @MqttMsgHandler({ topic: "+/B/+" })
            set msgSetter(m: Message) {
                this.msgSetterTester(m);
            }

            @MqttMsgHandler({ topic: "+/+/+" })
            msgMethod(m: Message) {
                this.msgMethodTester(m);
            }
        }
        expect(() => {
            const t = new testClass1();
        }).toThrow();
    });
});

describe("MqttConnection decorator tests", () => {
    it("should use decorated client property", () => {
        @MqttClient()
        class testClass1 {
            public _myClient: Client;
            @MqttConnection()
            public _myClient2: Client;
            public valMethodTester = jest.fn();
            public msgMethodTester = jest.fn();

            constructor() {
                this._myClient = new Client(config);
                this._myClient2 = new Client(config);
            }

            @MqttValue({
                topic: "A/#",
                type: "INT8",
            })
            valMethod(v: tJsVal) {
                this.valMethodTester(v);
            }

            @MqttMsgHandler({ topic: "A/B/C" })
            msgMethod(m: Message) {
                this.msgMethodTester(m);
            }
        }
        const t = new testClass1();
        const mqttClient = ((t as any)._myClient as any)
            ._mqttClient as MqttClientMock;
        const mqttClient2 = ((t as any)._myClient2 as any)
            ._mqttClient as MqttClientMock;
        mqttClient.connected = true;
        mqttClient2.connected = true;
        expect(mqttClient.subscribe).not.toBeCalled();
        expect(mqttClient2.subscribe).toBeCalledTimes(2);
    });

    it("should throw if decorated property is no Client", () => {
        @MqttClient()
        class testClass1 {
            public _myClient: Client;
            @MqttConnection()
            public _myClient2 = 1;
            public valMethodTester = jest.fn();
            public msgMethodTester = jest.fn();

            constructor() {
                this._myClient = new Client(config);
            }

            @MqttValue({
                topic: "A/#",
                type: "INT8",
            })
            valMethod(v: tJsVal) {
                this.valMethodTester(v);
            }

            @MqttMsgHandler({ topic: "A/B/C" })
            msgMethod(m: Message) {
                this.msgMethodTester(m);
            }
        }
        expect(() => {
            new testClass1();
        }).toThrow();
    });

    it("should use decorated client getter", () => {
        @MqttClient()
        class testClass1 {
            private _c: Client;
            private _c2: Client;
            get _myClient(): Client {
                return this._c;
            }
            @MqttConnection()
            get _myClient2(): Client {
                return this._c2;
            }
            public valMethodTester = jest.fn();
            public msgMethodTester = jest.fn();

            constructor() {
                this._c = new Client(config);
                this._c2 = new Client(config);
            }

            @MqttValue({
                topic: "A/#",
                type: "INT8",
            })
            valMethod(v: tJsVal) {
                this.valMethodTester(v);
            }

            @MqttMsgHandler({ topic: "A/B/C" })
            msgMethod(m: Message) {
                this.msgMethodTester(m);
            }
        }
        const t = new testClass1();
        const mqttClient = ((t as any)._myClient as any)
            ._mqttClient as MqttClientMock;
        const mqttClient2 = ((t as any)._myClient2 as any)
            ._mqttClient as MqttClientMock;
        mqttClient.connected = true;
        mqttClient2.connected = true;
        expect(mqttClient.subscribe).not.toBeCalled();
        expect(mqttClient2.subscribe).toBeCalledTimes(2);
    });

    it("should throw if decorated getter is no Client", () => {
        @MqttClient()
        class testClass1 {
            private _c: Client;
            get _myClient(): Client {
                return this._c;
            }
            @MqttConnection()
            get _myClient2(): number {
                return 11;
            }
            public valMethodTester = jest.fn();
            public msgMethodTester = jest.fn();

            constructor() {
                this._c = new Client(config);
            }

            @MqttValue({
                topic: "A/#",
                type: "INT8",
            })
            valMethod(v: tJsVal) {
                this.valMethodTester(v);
            }

            @MqttMsgHandler({ topic: "A/B/C" })
            msgMethod(m: Message) {
                this.msgMethodTester(m);
            }
        }
        expect(() => {
            new testClass1();
        }).toThrow();
    });

    it("should use decorated constructor parameter", () => {
        @MqttClient()
        class testClass1 {
            public valSetterTester = jest.fn();
            public msgSetterTester = jest.fn();

            constructor(c: Client, @MqttConnection() c2: Client) {}

            @MqttValue({
                topic: "A/B/+",
                type: "UINT8",
            })
            set valSetter(v: tJsVal) {
                this.valSetterTester(v);
            }

            @MqttMsgHandler({ topic: "+/B/+" })
            set msgSetter(m: Message) {
                this.msgSetterTester(m);
            }
        }
        const c = new Client(config);
        const c2 = new Client(config);
        const t = new testClass1(c, c2);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        const mqttClient2 = (c2 as any)._mqttClient as MqttClientMock;
        mqttClient.connected = true;
        mqttClient2.connected = true;
        expect(mqttClient.subscribe).not.toBeCalled();
        expect(mqttClient2.subscribe).toBeCalledTimes(2);
    });

    it("should throw if decorated constructor parameter is no Client", () => {
        @MqttClient()
        class testClass1 {
            public valSetterTester = jest.fn();
            public msgSetterTester = jest.fn();

            constructor(c: Client, @MqttConnection() c2: number) {}

            @MqttValue({
                topic: "A/B/+",
                type: "UINT8",
            })
            set valSetter(v: tJsVal) {
                this.valSetterTester(v);
            }

            @MqttMsgHandler({ topic: "+/B/+" })
            set msgSetter(m: Message) {
                this.msgSetterTester(m);
            }
        }
        expect(() => {
            const c = new Client(config);
            const t = new testClass1(c, 1);
        }).toThrow();
    });
});

describe("Message, Command and value handling test", () => {
    let client: Client;
    let clientMock: MqttClientMock;

    beforeEach(() => {
        client = new Client(config);
        clientMock = (client as any)._mqttClient;
    });

    function pubMsg(topic: string, qos: QoS, content: string) {
        clientMock.emitMessage(new Message(topic, qos, false, content));
    }

    function pubMsgObj(m: Message) {
        clientMock.emitMessage(m);
    }

    it("should handle message", async () => {
        @MqttClient()
        class TestClass {
            constructor(c: Client) {}
            test1 = jest.fn();
            test2 = jest.fn();

            @MqttMsgHandler({
                topic: "A/B/+",
                qos: 1,
                minQos: 1,
                throttleMS: 200,
            })
            set inc(msg: Message) {
                this.test1(msg);
            }

            @MqttMsgHandler({
                topic: "A/+/C",
                qos: 1,
                minQos: 1,
                throttleMS: 200,
            })
            aMethod(msg: Message) {
                this.test2(msg);
            }
        }

        const t = new TestClass(client);
        pubMsg("A/B/C", 0, "1");
        await promiseTimeout(300);
        pubMsg("A/B/C", 1, "2");
        await promiseTimeout(100);
        pubMsg("A/B/C", 2, "3");
        expect(t.test1).toBeCalledTimes(1);
        expect(t.test1.mock.calls[0][0].body).toBe("2");
        expect(t.test2).toBeCalledTimes(1);
        expect(t.test2.mock.calls[0][0].body).toBe("2");
    });

    it("should handle value", async () => {
        @MqttClient()
        class TestClass {
            constructor(c: Client) {}
            test1 = jest.fn();
            test2 = jest.fn();

            @MqttValue({
                topic: "+/B/C",
                type: "JSON",
                runtype: rt.Number.withConstraint((n) => n > 2),
                fallBackValue: -1,
                qos: 1,
                minQos: 1,
                throttleMS: 100,
            })
            aVal = -1000;

            @MqttValue({
                topic: "A/B/+",
                type: "JSON",
                runtype: rt.Number.withConstraint((n) => n > 2),
                fallBackValue: -1,
                qos: 1,
                minQos: 1,
                throttleMS: 100,
            })
            set inc(val: number) {
                this.test1(val);
            }

            @MqttValue({
                topic: "A/+/C",
                type: "JSON",
                runtype: rt.Number.withConstraint((n) => n > 2),
                fallBackValue: -1,
                qos: 1,
                minQos: 1,
                throttleMS: 100,
            })
            aMethod(val: number) {
                this.test2(val);
            }
        }

        const t = new TestClass(client);
        pubMsg("A/B/C", 0, "3");
        await promiseTimeout(200);
        pubMsg("A/B/C", 1, "4");
        expect(t.aVal).toBe(4);
        await promiseTimeout(50);
        pubMsg("A/B/C", 2, "5");
        await promiseTimeout(100);
        pubMsg("A/B/C", 2, "No json");
        expect(t.aVal).toBe(-1);
        await promiseTimeout(100);
        pubMsg("A/B/C", 2, "-5");
        expect(t.aVal).toBe(-1);
        expect(t.test1).toBeCalledTimes(3);
        expect(t.test1).toBeCalledWith(4);
        expect(t.test1).toBeCalledWith(-1);
        expect(t.test1).toBeCalledWith(-1);
        expect(t.test2).toBeCalledTimes(3);
        expect(t.test2).toBeCalledWith(4);
        expect(t.test2).toBeCalledWith(-1);
        expect(t.test2).toBeCalledWith(-1);
    });

    it("should handle command", async () => {
        @MqttClient()
        class TestClass {
            constructor(c: Client) {}
            test1 = jest.fn();
            test2 = jest.fn();

            @MqttCmdHandler({
                topic: "cmd/me/+/cmd1",
                qos: 1,
                minQos: 1,
                throttleMS: 100,
            })
            aMethod(req: Message, res: Message) {
                this.test1(req, res);
            }

            @MqttCmdHandler({
                topic: "A/+/cmd2",
                qos: 1,
                minQos: 1,
                throttleMS: 100,
                topicTransform: (topic: string[]) => {
                    return ["B", topic[1], "cmd2"];
                },
            })
            bMethod(req: Message, res: Message) {
                this.test2(req, res);
            }
        }

        const t = new TestClass(client);
        pubMsg("cmd/me/john/cmd1", 0, "1");
        pubMsg("A/john/cmd2", 0, "1");
        await promiseTimeout(200);
        pubMsg("cmd/me/john/cmd1", 1, "2");
        pubMsg("A/john/cmd2", 1, "2");
        await promiseTimeout(50);
        pubMsg("cmd/me/john/cmd1", 2, "3");
        pubMsg("A/john/cmd2", 2, "3");
        await promiseTimeout(150);
        pubMsg("cmd/me/john/cmd1", 2, "4");
        pubMsg("A/john/cmd2", 2, "4");
        await promiseTimeout(150);

        //MQTT v5 response topic
        const m1 = new Message("cmd/me/john/cmd1", 1, false, "1");
        m1.properties = { responseTopic: "my/response" };
        pubMsgObj(m1);

        const m2 = new Message("A/john/cmd2", 1, false, "1");
        m2.properties = { responseTopic: "another/response" };
        pubMsgObj(m2);

        expect(t.test1).toBeCalledTimes(3);
        let [req, res]: [Message, Message] = t.test1.mock.calls[0];
        expect(req.topic).toEqual(["cmd", "me", "john", "cmd1"]);
        expect(req.body).toEqual("2");
        expect(res.topic).toEqual(["cmdRes", "john", "me", "cmd1"]);
        [req, res] = t.test1.mock.calls[1];
        expect(req.topic).toEqual(["cmd", "me", "john", "cmd1"]);
        expect(req.body).toEqual("4");
        expect(res.topic).toEqual(["cmdRes", "john", "me", "cmd1"]);
        [req, res] = t.test1.mock.calls[2];
        expect(res.topic).toEqual(["my", "response"]);

        expect(t.test2).toBeCalledTimes(3);
        [req, res] = t.test2.mock.calls[0];
        expect(req.topic).toEqual(["A", "john", "cmd2"]);
        expect(req.body).toEqual("2");
        expect(res.topic).toEqual(["B", "john", "cmd2"]);
        [req, res] = t.test2.mock.calls[1];
        expect(req.topic).toEqual(["A", "john", "cmd2"]);
        expect(req.body).toEqual("4");
        expect(res.topic).toEqual(["B", "john", "cmd2"]);
        [req, res] = t.test2.mock.calls[2];
        expect(res.topic).toEqual(["another", "response"]);
    });
});

describe("External connection handler", () => {
    it("should call decortated function on connect", () => {
        @MqttClient()
        class testClass1 {
            public connectTest1 = jest.fn();
            public connectTest2 = jest.fn();

            constructor(c: Client) {}

            @MqttConnectionHandler()
            aMethod(isOnline: boolean) {
                this.connectTest1(isOnline);
            }

            @MqttConnectionHandler()
            bMethod(isOnline: boolean) {
                this.connectTest2(isOnline);
            }
        }
        const m = new Message("A/B/C", 1, false, "123");
        const c = new Client(config);
        const t = new testClass1(c);
        const mqttClient = (c as any)._mqttClient as MqttClientMock;
        expect(t.connectTest1).toHaveBeenLastCalledWith(false);
        expect(t.connectTest2).toHaveBeenLastCalledWith(false);
        mqttClient.connected = true;
        expect(t.connectTest1).toHaveBeenLastCalledWith(true);
        expect(t.connectTest2).toHaveBeenLastCalledWith(true);
        mqttClient.connected = false;
        expect(t.connectTest1).toHaveBeenLastCalledWith(false);
        expect(t.connectTest2).toHaveBeenLastCalledWith(false);
        mqttClient.connected = true;
        expect(t.connectTest1).toHaveBeenLastCalledWith(true);
        expect(t.connectTest2).toHaveBeenLastCalledWith(true);
        expect(t.connectTest1).toBeCalledTimes(4);
        expect(t.connectTest2).toBeCalledTimes(4);
    });
});

describe("unsubscribe method", () => {
    it("should unsubscribe when the method is called", () => {
        @MqttClient()
        class testClass1 {
            public destroyTester = jest.fn();

            @MqttValue({
                topic: "A/B/C",
                type: "INT16",
            })
            public propVal = 0;

            constructor(c: Client) {}

            @MqttUnsubHook()
            destroy(a: number, b: string, c: number) {
                this.destroyTester(a, b, c);
            }

            @MqttValue({
                topic: "A/B/+",
                type: "UINT8",
            })
            set valSetter(v: tJsVal) {}

            @MqttValue({
                topic: "A/#",
                type: "INT8",
            })
            valMethod(v: tJsVal) {}

            @MqttMsgHandler({ topic: "+/B/+" })
            set msgSetter(m: Message) {}

            @MqttMsgHandler({ topic: "+/+/+" })
            msgMethod(m: Message) {}
        }
        const m = new Message("A/B/C", 1, false, "123");
        const cl = new Client(config);
        const t = new testClass1(cl);
        const mqttClient = (cl as any)._mqttClient as MqttClientMock;
        mqttClient.connected = true;
        expect(mqttClient.subscribe).toBeCalledTimes(5);

        t.destroy(1, "abc", -1);
        expect(t.destroyTester).toBeCalledTimes(1);
        const [a, b, c] = t.destroyTester.mock.calls[0];
        expect(a).toBe(1);
        expect(b).toBe("abc");
        expect(c).toBe(-1);

        expect(mqttClient.unsubscribe).toBeCalledTimes(5);
    });
});

describe("subscribing tests", () => {
    it("should not add if topic is empty", () => {
        @MqttClient()
        class TestClass {
            static getConfig(this: TestClass): tMqttCmdHandlerConfig {
                return {
                    topic: "",
                };
            }

            constructor(c: Client) {}

            @MqttMsgHandler({ topic: "" })
            set aMsg(msg: Message) {}

            @MqttMsgHandler({ topic: "" })
            aMethod(msg: Message) {}

            @MqttValue({ topic: "" })
            set aValue(val: number) {}

            @MqttValue({ topic: "" })
            bMethod(msg: Message) {}

            @MqttCmdHandler({ topic: "" })
            cMethod(msg: Message, res: Message) {}

            @MqttCmdHandler(TestClass.getConfig)
            dMethod(msg: Message, res: Message) {}
        }
        const cl = new Client(config);
        const t = new TestClass(cl);
        const list = (t as any)[SUBSCRIPTION_LIST_KEY] as Array<Function>;
        expect(list.length).toBe(0);
    });

    it("should call subscribe with correct arguments", () => {
        @MqttClient()
        class TestClass {
            constructor(c: Client) {}

            @MqttMsgHandler({
                topic: "A",
            })
            set aMsg(msg: Message) {}

            @MqttMsgHandler({
                topic: "B",
                qos: 1,
            })
            aMethod(msg: Message) {}

            @MqttValue({
                topic: "C",
                qos: 2,
            })
            set aValue(val: number) {}

            @MqttValue({
                topic: "D",
                qos: 0,
            })
            bMethod(msg: Message) {}

            @MqttCmdHandler({
                topic: "E",
                qos: 1,
            })
            cMethod(msg: Message, res: Message) {}
        }
        const cl = new Client(config);
        const t = new TestClass(cl);
        const mqttClient = (cl as any)._mqttClient as MqttClientMock;
        mqttClient.connected = true;
        const list = (t as any)[SUBSCRIPTION_LIST_KEY] as Array<Function>;
        expect(list.length).toBe(5);
        let [topic, opts] = mqttClient.subscribe.mock.calls[0];
        expect(topic).toBe("A");
        expect(opts).toEqual({ qos: 0 });
        [topic, opts] = mqttClient.subscribe.mock.calls[1];
        expect(topic).toBe("B");
        expect(opts).toEqual({ qos: 1 });
        [topic, opts] = mqttClient.subscribe.mock.calls[2];
        expect(topic).toBe("E");
        expect(opts).toEqual({ qos: 1 });
        [topic, opts] = mqttClient.subscribe.mock.calls[3];
        expect(topic).toBe("C");
        expect(opts).toEqual({ qos: 2 });
        [topic, opts] = mqttClient.subscribe.mock.calls[4];
        expect(topic).toBe("D");
        expect(opts).toEqual({ qos: 0 });
    });
});
