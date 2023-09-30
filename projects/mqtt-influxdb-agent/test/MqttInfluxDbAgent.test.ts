// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { MqttInfluxDbAgent } from "../src/MqttInfluxDbAgent";
import { Item } from "../src/item/Item";
import { tAgentConfig } from "../src/types/AgentConfig";
jest.mock("../src/item/Item");

const ITEM = Item as unknown as jest.Mock;
const CONFIG: tAgentConfig = {
    mqtt: {
        url: "localhost",
        clientId: "client01",
    },
    influx: {
        url: "http://localhost",
        token: "token123",
        organization: "myOrg",
        flushIntervalMS: 1500,
    },
    items: [
        {
            topic: "A/+/C/+",
            bucket: "myBucket",
            measurement: "myMeasurement",
            datatype: "int",
            valueName: "myValueName",
            precision: "s",
            topicTags: "_/tag01/_/tag02",
            qos: 0,
            minTimeDiffMS: 100,
            searchPath: ["my", "path"],
        },
        {
            topic: "E/F/G/H",
            bucket: "myBucket02",
            measurement: "myMeasurement02",
        },
    ],
};

it("should create the items", () => {
    const agent = new MqttInfluxDbAgent(CONFIG);
    expect(ITEM).toBeCalledTimes(2);
});
