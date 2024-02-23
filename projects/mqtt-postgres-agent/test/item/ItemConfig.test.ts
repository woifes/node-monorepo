// SPDX-FileCopyrightText: © 2024 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client, Message } from "@woifes/mqtt-client";
import debug from "debug";
import { Pool } from "pg";
import { Item } from "../../src/item/Item";
import { ItemConfig } from "../../src/item/ItemConfig";

function wait(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

const DEBUGGER = debug("testdebugger");
const MQTT = new Client({ clientId: "myClient ", url: "myUrl" });
const POOL = {
    query: jest.fn().mockImplementation(() => {
        return Promise.resolve();
    }),
} as unknown as Pool;

let config: ItemConfig;

describe("Creation tests", () => {
    beforeEach(() => {
        config = {
            topic: "myTopic",
            table: "myTable",
            topicValues: "value01",
            constValues: {
                value02: "foo",
            },
            payloadValues: {
                value03: "myValuePath",
            },
            timestampValues: ["value04"],
            qos: 1,
            messageThrottleMS: 200,
        };
    });

    it("should not throw if values are unique", () => {
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).not.toThrow();
    });

    it("should throw if values are not unique", () => {
        config.topicValues = "value02";
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).toThrow();
    });

    it("should throw if values are unique", () => {
        config.constValues = { value01: "foo" };
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).toThrow();
    });

    it("should throw if values are not unique", () => {
        config.payloadValues = { value01: "myValuePath" };
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).toThrow();
    });

    it("should throw if values are not unique", () => {
        config.timestampValues = ["value01"];
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).toThrow();
    });
});

describe("Creation tests serial items", () => {
    beforeEach(() => {
        config = {
            topic: "myTopic",
            table: "myTable",
            topicValues: "value01",
            constValues: {
                value02: "foo",
                value05: ["1", "2", "3"],
                value06: ["11", "22", "33"],
            },
            payloadValues: {
                value03: "myValuePath",
                value07: ["7", "8", "9"],
                value08: ["77", "88", "99"],
            },
            timestampValues: ["value04"],
            qos: 1,
            messageThrottleMS: 200,
        };
    });

    it("should not throw with correct config", () => {
        expect(() => {
            expect(() => {
                const item = new Item(config, MQTT, POOL, DEBUGGER);
            }).not.toThrow();
        });
    });

    it("should throw if not all arrays from constants and payload values have equal size", () => {
        expect(() => {
            config.constValues!.value05 = [];
            expect(() => {
                const item = new Item(config, MQTT, POOL, DEBUGGER);
            }).toThrow();
        });
    });

    it("should throw if not all arrays from constants and payload values have equal size", () => {
        expect(() => {
            config.payloadValues!.value07 = [];
            expect(() => {
                const item = new Item(config, MQTT, POOL, DEBUGGER);
            }).toThrow();
        });
    });

    it("should throw if one of the arrays for serial values are empty", () => {
        expect(() => {
            config.constValues!.value05 = [];
            config.constValues!.value06 = [];
            config.payloadValues!.value07 = [];
            config.payloadValues!.value08 = [];
            expect(() => {
                const item = new Item(config, MQTT, POOL, DEBUGGER);
            }).toThrow();
        });
    });
});

describe("MinValueTimeDiff tests", () => {
    let item: Item;
    beforeEach(() => {
        jest.clearAllMocks();
        config = {
            topic: "myTopic/#",
            table: "myTable",
            payloadValues: {
                value: "@this",
            },
            minValueTimeDiffMS: 200,
        };
    });

    function simulateMsg(topic: string, value: number) {
        const msg = new Message(topic, undefined, undefined, String(value));
        (item as any).onMessage(msg);
    }

    it("should insert normally without minValueTimeStamp", async () => {
        delete config.minValueTimeDiffMS;
        item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg("myTopic", 1);
        simulateMsg("myTopic", 2);
        simulateMsg("myTopic", 3);
        const calls = ((POOL as any).query as jest.Mock).mock.calls;
        expect(calls.length).toBe(3);
        let [query, values] = calls[0];
        expect(query).toBe("INSERT INTO myTable(value) VALUES($1);");
        expect(values).toEqual(["1"]);

        [query, values] = calls[1];
        expect(query).toBe("INSERT INTO myTable(value) VALUES($1);");
        expect(values).toEqual(["2"]);

        [query, values] = calls[2];
        expect(query).toBe("INSERT INTO myTable(value) VALUES($1);");
        expect(values).toEqual(["3"]);
    });

    it("should insert after min time is gone", async () => {
        item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg("myTopic/A", 1);
        simulateMsg("myTopic/A", 2);
        simulateMsg("myTopic/B", 10);
        let calls = ((POOL as any).query as jest.Mock).mock.calls;
        expect(calls.length).toBe(2);
        await wait(300);
        simulateMsg("myTopic/A", 3);
        calls = ((POOL as any).query as jest.Mock).mock.calls;
        expect(calls.length).toBe(3);
    });
});
