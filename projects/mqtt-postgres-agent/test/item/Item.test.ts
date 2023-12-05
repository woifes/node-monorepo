// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";
import debug from "debug";
import { Pool } from "pg";
import { Item } from "../../src/item/Item";
import { ItemConfig } from "../../src/item/ItemConfig";

async function wait(ms: number) {
    return new Promise((resolve, reject) => {
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

function simulateMsg(topic: string, message: string, qos = 0) {
    (MQTT as any).onMessageCallback(topic, Buffer.from(message, "utf-8"), {
        qos,
        retain: false,
    });
}

let config: ItemConfig;

beforeEach(() => {
    jest.clearAllMocks();
});

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
            minTimeDiffMS: 200,
        };
    });

    it("should now throw if values are unique", () => {
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).not.toThrow();
    });

    it("should now throw if values are unique", () => {
        config.topicValues = "value02";
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).toThrow();
    });

    it("should now throw if values are unique", () => {
        config.constValues = { value01: "foo" };
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).toThrow();
    });

    it("should now throw if values are unique", () => {
        config.payloadValues = { value01: "myValuePath" };
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).toThrow();
    });

    it("should now throw if values are unique", () => {
        config.timestampValues = ["value01"];
        expect(() => {
            const item = new Item(config, MQTT, POOL, DEBUGGER);
        }).toThrow();
    });
});

describe("Insert tests", () => {
    it("should insert topic value", async () => {
        config = {
            topic: "A/+/C",
            table: "myTable",
            topicValues: "_/value01/_",
        };
        const item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg("A/B/C", "123");
        await wait(10);
        const [query, values] = ((POOL as any).query as jest.Mock).mock
            .calls[0];
        expect(query).toBe("INSERT INTO myTable(value01) VALUES($1);");
        expect(values).toEqual(["B"]);
        item.destroy();
    });

    it("should insert payload value", async () => {
        config = {
            topic: "A/+/C",
            table: "myTable",
            topicValues: "_/value01/_",
            payloadValues: {
                value02: "@this",
            },
        };
        const item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg("A/B/C", "123");
        await wait(10);
        const [query, values] = ((POOL as any).query as jest.Mock).mock
            .calls[0];
        expect(query).toBe(
            "INSERT INTO myTable(value01, value02) VALUES($1, $2);",
        );
        expect(values).toEqual(["B", "123"]);
        item.destroy();
    });

    it("should insert const value", async () => {
        config = {
            topic: "A/+/C",
            table: "myTable",
            topicValues: "_/value01/_",
            payloadValues: {
                value02: "@this",
            },
            constValues: {
                value03: "foo",
            },
        };
        const item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg("A/B/C", "123");
        await wait(10);
        const [query, values] = ((POOL as any).query as jest.Mock).mock
            .calls[0];
        expect(query).toBe(
            "INSERT INTO myTable(value03, value01, value02) VALUES($1, $2, $3);",
        );
        expect(values).toEqual(["foo", "B", "123"]);
        item.destroy();
    });

    it("should insert timestamp value", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2023, 11, 2));
        config = {
            topic: "A/+/C",
            table: "myTable",
            topicValues: "_/value01/_",
            payloadValues: {
                value02: "@this",
            },
            constValues: {
                value03: "foo",
            },
            timestampValues: ["value04"],
        };
        const item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg("A/B/C", "123");
        jest.useRealTimers();
        await wait(10);
        const [query, values] = ((POOL as any).query as jest.Mock).mock
            .calls[0];
        expect(query).toBe(
            "INSERT INTO myTable(value03, value04, value01, value02) VALUES($1, $2, $3, $4);",
        );
        expect(values).toEqual([
            "foo",
            "Fri, 01 Dec 2023 23:00:00 GMT",
            "B",
            "123",
        ]);
        item.destroy();
    });
});
