// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client } from "../../src/Client";
import { CONNECTION_TO_USE_INFO } from "../../src/decorator/constants";
import { MqttConnection } from "../../src/decorator/MqttConnection";
jest.mock("../../src/Client");

const config = {
    url: "url",
    clientId: "id",
    auth: {
        username: "user",
        password: "pw",
    },
};

it("should add property to info", () => {
    class testClass1 {
        @MqttConnection()
        private c1: Client = new Client(config);
        constructor() {}
    }
    const t = new testClass1();
    expect((t as any)[CONNECTION_TO_USE_INFO]).toBe("c1");
});

it("should add getter to info", () => {
    class testClass1 {
        private c1: Client = new Client(config);
        @MqttConnection()
        get client(): Client {
            return this.c1;
        }
        constructor() {}
    }
    const t = new testClass1();
    expect((t as any)[CONNECTION_TO_USE_INFO]).toBe("client");
});

it("should throw if setter is decorated", () => {
    expect(() => {
        class testClass1 {
            private c1: Client = new Client(config);
            @MqttConnection()
            set client(c: Client) {
                this.c1 = c;
            }
            constructor() {}
        }
    }).toThrow();
});

it("should throw if method is decorated", () => {
    expect(() => {
        class testClass1 {
            private c1: Client = new Client(config);
            @MqttConnection()
            getClient(): Client {
                return this.c1;
            }
            constructor() {}
        }
    }).toThrow();
});

it("should add arg index when param is decorated", () => {
    class testClass1 {
        constructor(a: number, b: number, @MqttConnection() c: Client) {}
    }
    expect((testClass1 as any)[CONNECTION_TO_USE_INFO]).toBe(2);
});
