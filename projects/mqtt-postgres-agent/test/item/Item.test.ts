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

    it("should handle topic variants", async () => {
        config = {
            topic: "A/1+2/C",
            table: "myTable",
            topicValues: "_/value01/_",
        };
        const item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg("A/1/C", "123");
        await wait(10);
        simulateMsg("A/2/C", "123");
        await wait(10);
        let [query, values] = ((POOL as any).query as jest.Mock).mock.calls[0];
        expect(query).toBe("INSERT INTO myTable(value01) VALUES($1);");
        expect(values).toEqual(["1"]);
        [query, values] = ((POOL as any).query as jest.Mock).mock.calls[1];
        expect(query).toBe("INSERT INTO myTable(value01) VALUES($1);");
        expect(values).toEqual(["2"]);
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
            "INSERT INTO myTable(value03, value01, value02, value04) VALUES($1, $2, $3, to_timestamp($4));",
        );
        expect(values).toEqual(["foo", "B", "123", "1701471600"]);
        item.destroy();
    });

    it("should insert a combination of serial values", async () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2023, 11, 2));
        config = {
            topic: "A/+/C",
            table: "myTable",
            topicValues: "_/myTopicVal/_",
            payloadValues: {
                metaValue: "meta",
                power: ["powers.0", "powers.2"],
                temperature: ["temperatures.1", "temperatures.#"],
            },
            constValues: {
                sensor: ["foo", "bar"],
            },
            timestampValues: ["time"],
        };
        const item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg(
            "A/B/C",
            JSON.stringify({
                meta: "mySensor",
                powers: [11, 22, 33],
                temperatures: [7, 8, 9],
            }),
        );
        jest.useRealTimers();
        await wait(10);
        const calls = ((POOL as any).query as jest.Mock).mock.calls;
        expect((POOL as any).query as jest.Mock).toBeCalledTimes(2);
        let [query, values] = calls[0];
        expect(query).toBe(
            "INSERT INTO myTable(myTopicVal, metaValue, power, temperature, sensor, time) VALUES($1, $2, $3, $4, $5, to_timestamp($6));",
        );
        expect(values).toEqual([
            "B",
            "mySensor",
            "11",
            "8",
            "foo",
            "1701471600",
        ]);
        [query, values] = calls[1];
        expect(query).toBe(
            "INSERT INTO myTable(myTopicVal, metaValue, power, temperature, sensor, time) VALUES($1, $2, $3, $4, $5, to_timestamp($6));",
        );
        expect(values).toEqual([
            "B",
            "mySensor",
            "33",
            "3",
            "bar",
            "1701471600",
        ]);

        item.destroy();
    });
});

describe("Timing tests", () => {
    it("should ignore when no min value is set", async () => {
        config = {
            topic: "A/+/C",
            table: "myTable",
            topicValues: "_/value01/_",
        };
        const item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg("A/B/C", "123");
        await wait(1);
        simulateMsg("A/B/C", "345");
        expect((POOL as any).query as jest.Mock).toBeCalledTimes(2);
        item.destroy();
    });

    it("should insert for the correct min time value", async () => {
        config = {
            topic: "A/+/C",
            table: "myTable",
            topicValues: "_/value01/_",
            minValueTimeDiffMS: 100,
        };
        const item = new Item(config, MQTT, POOL, DEBUGGER);
        simulateMsg("A/B/C", "123");
        await wait(50);
        simulateMsg("A/B/C", "345");
        await wait(1);
        simulateMsg("A/B/C", "678");
        await wait(51);
        simulateMsg("A/B/C", "9AB");
        expect((POOL as any).query as jest.Mock).toBeCalledTimes(2);
        item.destroy();
    });
});
