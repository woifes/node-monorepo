// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { InfluxDB, Point } from "@influxdata/influxdb-client";
import { Client } from "@woifes/mqtt-client";
import { tItemConfig } from "projects/mqtt-influxdb-agent/src/item/ItemConfig";
import { Item } from "../../src/item/Item";

let MQTT: Client;
const INFLUX = {
    getWriteApi: jest.fn().mockImplementation(() => {
        return {
            writePoint: jest.fn(),
        };
    }),
};

function createConfig(): tItemConfig {
    return {
        topic: "A/+/C/+",
        bucket: "myBucket",
        measurement: "myMeasurement",
        datatype: "uint",
        valueName: "valueName",
        precision: "s",
        topicTags: "_/tt01/_/tt02",
        //qos?: number | undefined;
        //minTimeDiffMS?: number | undefined;
        //searchPath?: (string | number)[] | undefined;
    };
}

function simulateMsg(topic: string, message: string, qos: number) {
    (MQTT as any).onMessageCallback(topic, Buffer.from(message, "utf-8"), {
        qos,
        retain: false,
    });
}

beforeEach(() => {
    MQTT = new Client({ url: "abc", clientId: "client01" });
    jest.clearAllMocks();
});

describe("Creation test", () => {
    it("should create write config", () => {
        const CONFIG = createConfig();
        const item = new Item(
            CONFIG,
            "myOrg",
            INFLUX as unknown as InfluxDB,
            MQTT
        );

        expect(INFLUX.getWriteApi).toBeCalledTimes(1);
        expect(INFLUX.getWriteApi).toBeCalledWith("myOrg", "myBucket", "s");
    });
});

describe("Write value test", () => {
    let config: tItemConfig;

    beforeEach(() => {
        config = createConfig();
    });

    it("should correctly push point", () => {
        const item = new Item(
            config,
            "myOrg",
            INFLUX as unknown as InfluxDB,
            MQTT
        );

        const writeApi = (item as any).writeApi;

        simulateMsg("A/B/C/D", "7", 0);

        expect(writeApi.writePoint).toBeCalledTimes(1);
        const point = (writeApi.writePoint as jest.Mock).mock
            .calls[0][0] as Point;
        expect(point.fields).toEqual({ valueName: "7u" });
        expect((point as any).tags).toEqual({ tt01: "B", tt02: "D" });
    });

    it("should correctly push point (array value)", () => {
        const item = new Item(
            config,
            "myOrg",
            INFLUX as unknown as InfluxDB,
            MQTT
        );

        const writeApi = (item as any).writeApi;

        simulateMsg("A/B/C/D", "[1,3,7]", 0);

        expect(writeApi.writePoint).toBeCalledTimes(1);
        const point = (writeApi.writePoint as jest.Mock).mock
            .calls[0][0] as Point;
        expect(point.fields).toEqual({
            valueName1: "1u",
            valueName2: "3u",
            valueName3: "7u",
        });
        expect((point as any).tags).toEqual({ tt01: "B", tt02: "D" });
    });

    it("should correctly push point (json)", () => {
        config.searchPath = ["my", "val", "1"];

        const item = new Item(
            config,
            "myOrg",
            INFLUX as unknown as InfluxDB,
            MQTT
        );

        const writeApi = (item as any).writeApi;

        simulateMsg(
            "A/B/C/D",
            JSON.stringify({
                my: { val: [0, 7, 10] },
            }),
            0
        );

        expect(writeApi.writePoint).toBeCalledTimes(1);
        const point = (writeApi.writePoint as jest.Mock).mock
            .calls[0][0] as Point;
        expect(point.fields).toEqual({
            valueName: "7u",
        });
        expect((point as any).tags).toEqual({ tt01: "B", tt02: "D" });
    });

    it("should correctly push point (json and array value)", () => {
        config.searchPath = ["my", "val"];

        const item = new Item(
            config,
            "myOrg",
            INFLUX as unknown as InfluxDB,
            MQTT
        );

        const writeApi = (item as any).writeApi;

        simulateMsg(
            "A/B/C/D",
            JSON.stringify({
                my: { val: [1, 3, 7] },
            }),
            0
        );

        expect(writeApi.writePoint).toBeCalledTimes(1);
        const point = (writeApi.writePoint as jest.Mock).mock
            .calls[0][0] as Point;
        expect(point.fields).toEqual({
            valueName1: "1u",
            valueName2: "3u",
            valueName3: "7u",
        });
        expect((point as any).tags).toEqual({ tt01: "B", tt02: "D" });
    });
});
