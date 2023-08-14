// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { rtInverterConfig } from "../../src/inverter/InverterConfig";

it("should validate full config", () => {
    expect(() => {
        rtInverterConfig.check({
            id: "myInverter",
            serialNumber: 1235,
            pNomW: 1200,
            suntraceInfo: {
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
        rtInverterConfig.check({
            id: "myInverter",
            serialNumber: 1235,
        });
    }).not.toThrow();
});
