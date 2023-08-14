// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import { rtYasdiMqttConfig } from "../src/YasdiMqttConfig";

it("should validate example file", () => {
    const config = parse(
        readFileSync(
            join(__dirname, "..", "examples", "YasdiMqttConfig.example.yaml"),
            "utf-8",
        ),
    );

    expect(() => {
        rtYasdiMqttConfig.check(config);
    }).not.toThrow();
});

it("should validate correct config", () => {
    expect(() => {
        rtYasdiMqttConfig.check({
            name: "client01",
            mqtt: {
                url: "localhost",
                clientId: "client01",
            },
            yasdi: {
                sendIntervalS: 5,
                mqttPrefix: "tags",

                plants: [
                    {
                        name: "plant01",
                        alias: "roof01",
                        inverter: [
                            {
                                id: "inv01",
                                serialNumber: 123456,
                                pNomW: 1500,
                                suntraceInfo: {
                                    coordinates: {
                                        latitude: 1,
                                        longitude: 2,
                                        heightAboveSeeLevelKM: 3,
                                    },
                                    orientation: {
                                        directionDeg: 1,
                                        tiltDeg: 2,
                                    },
                                },
                            },
                            {
                                id: "inv02",
                                serialNumber: 789,
                            },
                        ],
                    },
                ],
                suntraceInfo: {
                    coordinates: {
                        latitude: 1,
                        longitude: 2,
                        heightAboveSeeLevelKM: 3,
                    },
                    orientation: { directionDeg: 1, tiltDeg: 2 },
                },
            },
        });
    }).not.toThrow();
});

it("should not allow negative send intervall", () => {
    expect(() => {
        rtYasdiMqttConfig.check({
            name: "client01",
            mqtt: {
                url: "localhost",
                clientId: "client01",
                notifyPresencePrefix: "clients",
                messageCacheTimeS: 3,
                caCertificate: "path or cert",
            },
            yasdi: {
                sendIntervalS: -5,
                mqttPrefix: "tags",
                plants: [],
            },
        });
    }).toThrow();
});
