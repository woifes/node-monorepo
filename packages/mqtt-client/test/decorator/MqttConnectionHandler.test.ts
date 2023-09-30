// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { MqttConnectionHandler } from "../../src/decorator/MqttConnectionHandler";
import { CONNECTION_HANDLER_LIST_KEY } from "../../src/decorator/constants";

describe("setter decorating test", () => {
    it("should throw when set on a setter", () => {
        expect(() => {
            class testClass {
                public test: jest.Mock = jest.fn();

                @MqttConnectionHandler()
                set aConnectSetter(a: number) {
                    this.test();
                }
            }
        }).toThrowError(
            "MqttConnectHandler set on something which is not a method",
        );
    });
});

describe("method decorating test", () => {
    class testClass {
        public test: jest.Mock = jest.fn();

        @MqttConnectionHandler()
        aMethod() {
            this.test();
        }
    }

    it("should add method to the internal list", () => {
        const t = new testClass();
        const list = (t as any)[CONNECTION_HANDLER_LIST_KEY] as (() => void)[];
        expect(list.length).toBe(1);
        list[0].bind(t)();
        expect(t.test).toBeCalledTimes(1);
    });
});
