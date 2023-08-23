// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";
import { NodeYasdi } from "@woifes/node-yasdi";
import { Inverter } from "../../src/inverter/Inverter";
import { postIntensity } from "../../src/sun/postIntensity";
jest.mock("../../src/sun/postIntensity");

const MQTT = new Client({
    url: "abc",
    clientId: "client01",
});
const PUBLISH_VALUE_SYNC_SPY = jest.spyOn(MQTT, "publishValueSync");
MQTT.publishValue = jest.fn(() => {
    return Promise.resolve();
});

const INVERTER_MOCK = {
    getData: jest.fn(),
};
const NODE_YASDI_MOCK = {
    getInverterBySerial: jest.fn((serial: number) => {
        if (serial === 1234) {
            return INVERTER_MOCK;
        }
    }),
};
const POST_INTENSITY_MOCK = postIntensity as jest.Mock;

let inverter: Inverter;

beforeEach(() => {
    jest.clearAllMocks();

    inverter = new Inverter(
        { id: "myInverter", serialNumber: 1234 },
        NODE_YASDI_MOCK as unknown as NodeYasdi,
        MQTT,
        "myTopicPrefix",
    );
});

describe("Search tests", () => {
    it("should identify its serial", () => {
        inverter.onNewDevice(999);
        expect(inverter.present).toBe(false);
        inverter.onNewDevice(1234);
        expect(inverter.present).toBe(true);
    });

    it("should find its serial at least at device search end", () => {
        expect(inverter.present).toBe(false);
        inverter.onDeviceSearchEnd([1, 2, 1234]);
        expect(inverter.present).toBe(true);
    });
});

describe("Send data tests", () => {
    it("should send all data which the inverter object delivers", async () => {
        INVERTER_MOCK.getData.mockImplementationOnce(() => {
            const m = new Map();
            m.set("val01", {
                value: 1,
                unit: "unit01",
                timeStamp: "timeStamp01",
                statusText: "statusText01",
            });
            m.set("val02", {
                value: 2,
                unit: "unit02",
                timeStamp: "timeStamp02",
                statusText: "statusText02",
            });
            return Promise.resolve(m);
        });

        await inverter.publishData();

        expect(POST_INTENSITY_MOCK).not.toBeCalled();
        expect(NODE_YASDI_MOCK.getInverterBySerial).toBeCalledTimes(1);
        expect(INVERTER_MOCK.getData).toBeCalledTimes(1);
        expect(PUBLISH_VALUE_SYNC_SPY).toBeCalledTimes(8);
    });

    it("should send intensity if sun trace info is set", async () => {
        const SUN_TRACE_INFO = {
            coordinates: {
                latitude: 1,
                longitude: 2,
                heightAboveSeeLevelKM: 3,
            },
            orientation: { directionDeg: 1, tiltDeg: 2 },
        };
        POST_INTENSITY_MOCK.mockImplementationOnce(() => {
            return Promise.resolve();
        });
        INVERTER_MOCK.getData.mockImplementationOnce(() => {
            return Promise.resolve(new Map());
        });
        inverter = new Inverter(
            {
                id: "myInverter",
                serialNumber: 1234,
                suntraceInfo: SUN_TRACE_INFO,
            },
            NODE_YASDI_MOCK as unknown as NodeYasdi,
            MQTT,
            "myTopicPrefix",
        );

        await inverter.publishData();

        expect(POST_INTENSITY_MOCK).toBeCalledTimes(1);
        const [sunTraceInfo, topic, mqtt] = POST_INTENSITY_MOCK.mock.calls[0];
        expect(sunTraceInfo).toEqual(SUN_TRACE_INFO);
        expect(topic).toBe("myTopicPrefix/inverter/myInverter/sunIntensity");
        expect(mqtt).toEqual(MQTT);
    });
});
