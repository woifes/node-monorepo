// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";
import { NodeYasdi } from "@woifes/node-yasdi";
import { Plant } from "../../src/plant/Plant";
import { postIntensity } from "../../src/sun/postIntensity";
jest.mock("../../src/sun/postIntensity");

const MQTT = new Client({
    url: "abc",
    clientId: "client01",
});
const PUBLISH_VALUE_SYNC_SPY = jest.spyOn(MQTT, "publishValueSync");
const INVERTER_MOCK = {
    getData: jest.fn(),
};
const NODE_YASDI_MOCK = {
    getInverterBySerial: jest.fn((serial: number) => {
        return INVERTER_MOCK;
    }),
};
const POST_INTENSITY_MOCK = postIntensity as jest.Mock;

let plant: Plant;

beforeEach(() => {
    jest.clearAllMocks();
    plant = new Plant(
        {
            name: "Roof",
            alias: "MyPlant",
            inverter: [
                { id: "inv01", serialNumber: 123 },
                { id: "inv02", serialNumber: 456 },
            ],
        },
        "myTopicPrefix",
        MQTT,
        NODE_YASDI_MOCK as unknown as NodeYasdi,
    );
});

describe("creation tests", () => {
    it("should create plant and inverter", () => {
        expect(plant.inverterCount).toBe(2);
        expect(plant.foundInverterCount).toBe(0);
    });

    it("should send inverter count and alias during connect", () => {
        (MQTT as any).onConnectCallback();
    });
});

describe("inverter search tests", () => {
    it("should delegate the inverter found events", () => {
        plant.onNewDevice(123);
        expect(plant.foundInverterCount).toBe(1);
        expect(PUBLISH_VALUE_SYNC_SPY).toBeCalledTimes(1);
        let [topic, content] = PUBLISH_VALUE_SYNC_SPY.mock.calls[0];
        expect(topic).toBe("myTopicPrefix/Roof/deviceFound");
        expect(content).toBe("1/2");

        plant.onDeviceSearchEnd([123, 456]);
        expect(plant.foundInverterCount).toBe(2);
        expect(PUBLISH_VALUE_SYNC_SPY).toBeCalledTimes(2);
        [topic, content] = PUBLISH_VALUE_SYNC_SPY.mock.calls[1];
        expect(topic).toBe("myTopicPrefix/Roof/deviceFound");
        expect(content).toBe("2/2");
    });
});

describe("push data tests", () => {
    it("should call the publish function of all inverter", async () => {
        await plant.publishData();
        expect(NODE_YASDI_MOCK.getInverterBySerial).toBeCalledTimes(2);
        expect(INVERTER_MOCK.getData).toBeCalledTimes(2);
    });

    it("should send sun intensity when configured", async () => {
        const SUN_TRACE_INFO = {
            coordinates: {
                latitude: 1,
                longitude: 2,
                heightAboveSeeLevelKM: 3,
            },
            orientation: { directionDeg: 1, tiltDeg: 2 },
        };

        plant = new Plant(
            {
                name: "Roof",
                alias: "MyPlant",
                sunTraceInfo: SUN_TRACE_INFO,
                inverter: [
                    { id: "inv01", serialNumber: 123 },
                    { id: "inv02", serialNumber: 456 },
                ],
            },
            "myTopicPrefix",
            MQTT,
            NODE_YASDI_MOCK as unknown as NodeYasdi,
        );

        POST_INTENSITY_MOCK.mockImplementationOnce(() => {
            return Promise.resolve();
        });

        await plant.publishData();
        expect(POST_INTENSITY_MOCK).toBeCalledTimes(1);
        const [sunTraceInfo, topic, mqtt] = POST_INTENSITY_MOCK.mock.calls[0];
        expect(sunTraceInfo).toEqual(SUN_TRACE_INFO);
        expect(topic).toBe("myTopicPrefix/Roof/sunIntensity");
        expect(mqtt).toEqual(MQTT);
    });
});
