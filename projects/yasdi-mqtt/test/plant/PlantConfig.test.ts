// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtPlantConfig } from "../../src/plant/PlantConfig";

it("should validate correct config", () => {
    expect(() => {
        rtPlantConfig.check({
            name: "Roof",
            alias: "myPlant",
            inverter: [
                { id: "inv01", serialNumber: 123 },
                { id: "inv02", serialNumber: 456 },
            ],
            sunTraceInfo: {
                coordinates: {
                    latitude: 123,
                    longitude: 123,
                    heightAboveSeeLevelKM: 123,
                },
                orientation: {
                    tiltDeg: 123,
                    directionDeg: 123,
                },
            },
        });
    }).not.toThrow();

    expect(() => {
        rtPlantConfig.check({
            name: "Roof",
            inverter: [
                { id: "inv01", serialNumber: 123 },
                { id: "inv02", serialNumber: 456 },
            ],
        });
    }).not.toThrow();
});

it("should fail if id of inverter is not unique", () => {
    expect(() => {
        rtPlantConfig.check({
            name: "Roof",
            inverter: [
                { id: "inv01", serialNumber: 123 },
                { id: "inv01", serialNumber: 456 },
            ],
        });
    }).toThrow();
});
