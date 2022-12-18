// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { RtMqttTopic } from "../../src/utils/RtMqttTopic";

it("should not validate empty string", () => {
    expect(() => {
        RtMqttTopic.check([]);
    }).toThrow();
});

it("should not validate empty topic level string", () => {
    expect(() => {
        RtMqttTopic.check("A//B/C".split("/"));
    }).toThrow();
});

it("should not validate trailing /", () => {
    expect(() => {
        RtMqttTopic.check("/A/B/C".split("/"));
    }).toThrow();
});

it("should validate topic without wildcards", () => {
    expect(() => {
        RtMqttTopic.check("A/B/C".split("/"));
    }).not.toThrow();
});

it("should validate topic with wildcards", () => {
    expect(() => {
        RtMqttTopic.check("A/+/+/#".split("/"));
    }).not.toThrow();
});

it("should not validate topic with # other than the end", () => {
    expect(() => {
        RtMqttTopic.check("A/#/+/C".split("/"));
    }).toThrow();
});

it("should not validate topic with + mixed with characters", () => {
    expect(() => {
        RtMqttTopic.check("A/+abc/C".split("/"));
    }).toThrow();
});

it("should not validate topic with # mixed with characters", () => {
    expect(() => {
        RtMqttTopic.check("A/B/#abc".split("/"));
    }).toThrow();
});
