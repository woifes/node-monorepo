// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import { MatrixMqttBridgeConfig } from "../src/MatrixMqttBridgeConfig";

it("should validate example file", () => {
    const e1 = join(__dirname, "..", "examples", "bridge.yaml");

    expect(() => {
        MatrixMqttBridgeConfig.check(parse(readFileSync(e1, "utf-8")));
    }).not.toThrow();
});

it("should validate correct runtype", () => {
    expect(() => {
        MatrixMqttBridgeConfig.check({
            mqtt: {
                url: "localhost",
                clientId: "client01", //without auth the client will not connect
            },

            matrix: {
                url: "localhost",
                userName: "user01",
                password: "abc",
            },

            bridge: {
                mqttTopicPrefix: "cde",
                matrixMaxMessageAgeS: 1,
                rooms: [{ roomId: "room01", federate: false, public: true }],
            },
        });
    }).not.toThrow();
});

it("should not allow special MQTT characters in mqttTopicPrefix", () => {
    expect(() => {
        MatrixMqttBridgeConfig.check({
            mqtt: {
                url: "localhost",
                clientId: "client01", //without auth the client will not connect
            },

            matrix: {
                url: "localhost",
                userName: "user01",
                password: "abc",
            },

            bridge: {
                mqttTopicPrefix: "ab#c",
                rooms: [{ roomId: "room01", federate: false, public: true }],
            },
        });
    }).toThrow();

    expect(() => {
        MatrixMqttBridgeConfig.check({
            mqtt: {
                url: "localhost",
                clientId: "client01", //without auth the client will not connect
            },

            matrix: {
                url: "localhost",
                userName: "user01",
                password: "abc",
            },

            bridge: {
                mqttTopicPrefix: "ab+c",
                rooms: [{ roomId: "room01", federate: false, public: true }],
            },
        });
    }).toThrow();
});

it("should not allow special MQTT characters in roomId", () => {
    expect(() => {
        MatrixMqttBridgeConfig.check({
            mqtt: {
                url: "localhost",
                clientId: "client01", //without auth the client will not connect
            },

            matrix: {
                url: "localhost",
                userName: "user01",
                password: "abc",
            },

            bridge: {
                rooms: [{ roomId: "room+01", federate: false, public: true }],
            },
        });
    }).toThrow();

    expect(() => {
        MatrixMqttBridgeConfig.check({
            mqtt: {
                url: "localhost",
                clientId: "client01", //without auth the client will not connect
            },

            matrix: {
                url: "localhost",
                userName: "user01",
                password: "abc",
            },

            bridge: {
                rooms: [{ roomId: "room#01", federate: false, public: true }],
            },
        });
    }).toThrow();

    expect(() => {
        MatrixMqttBridgeConfig.check({
            mqtt: {
                url: "localhost",
                clientId: "client01", //without auth the client will not connect
            },

            matrix: {
                url: "localhost",
                userName: "user01",
                password: "abc",
            },

            bridge: {
                rooms: [{ roomId: "room/01", federate: false, public: true }],
            },
        });
    }).toThrow();
});
