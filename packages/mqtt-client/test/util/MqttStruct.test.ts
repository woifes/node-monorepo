// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { QoS } from "mqtt";
import { Client } from "../../src/Client";
import { MqttStruct } from "../../src/utils/MqttStruct";

let cl: Client;

function simMessage(topic: string, qos: QoS, content: string) {
    (cl as any).onMessageCallback(
        topic.split("").join("/"),
        Buffer.from(content),
        {
            qos: qos,
            retain: false,
        }
    );
}

beforeEach(() => {
    cl = new Client({
        url: "loclahost",
        clientId: "client01",
    });
});

it("should fill up topic struct correctly", () => {
    const struct = new MqttStruct(
        {
            topic: "#",
            valueKey: "#",
            qos: 1,
            valueTransform: (content: string) => {
                return "@: " + content;
            },
        },
        cl
    );
    simMessage("BA", 1, "3");
    simMessage("BAA", 1, "7");
    simMessage("BBA", 1, "21");
    simMessage("A", 1, "9");
    simMessage("AA", 1, "100");
    simMessage("AAA", 1, "1");
    simMessage("AAB", 1, "20");
    expect(struct.toJSON()).toEqual({
        B: {
            A: {
                "#": "@: 3",
                A: "@: 7",
            },
            B: {
                A: "@: 21",
            },
        },
        A: {
            "#": "@: 9",
            A: {
                "#": "@: 100",
                A: "@: 1",
                B: "@: 20",
            },
        },
    });
});
