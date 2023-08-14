// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Client } from "@woifes/mqtt-client";
import { getIntensity } from "../../src/sun/getIntensity";
import { postIntensity } from "../../src/sun/postIntensity";
jest.mock("../../src/sun/getIntensity");
(getIntensity as jest.Mock).mockImplementation(() => {
    return 123;
});

const MQTT = new Client({
    url: "abc",
    clientId: "client01",
});
MQTT.publishValue = jest.fn(() => {
    return Promise.resolve();
});

it("should call intensity and send the value", () => {
    postIntensity(
        {
            coordinates: {
                latitude: 1,
                longitude: 2,
                heightAboveSeeLevelKM: 3,
            },
            orientation: { directionDeg: 1, tiltDeg: 2 },
        },
        "myTopic",
        MQTT,
    );

    expect(getIntensity).toBeCalledTimes(1);
    expect(MQTT.publishValue).toBeCalledTimes(1);
    const [topic, intensity, type] = (MQTT.publishValue as jest.Mock).mock
        .calls[0];
    expect(topic).toBe("myTopic");
    expect(intensity).toBeCloseTo(123);
    expect(type).toBe("FLOAT");
});
