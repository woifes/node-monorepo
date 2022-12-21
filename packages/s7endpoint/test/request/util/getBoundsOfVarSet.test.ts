// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { getBoundsOfVarSet } from "../../../src/request";

it("should get bounds when in a row", () => {
    expect(
        getBoundsOfVarSet([
            { area: "DB", type: "INT16", count: 3, byteIndex: 0 },
            { area: "DB", type: "INT16", byteIndex: 6 },
            { area: "DB", type: "BIT", byteIndex: 8, bitIndex: 3 },
        ])
    ).toEqual([0, 9]);
});

it("should get bounds if overlapp", () => {
    expect(
        getBoundsOfVarSet([
            { area: "DB", type: "INT16", count: 3, byteIndex: 0 },
            { area: "DB", type: "INT16", byteIndex: 5 },
            { area: "DB", type: "BIT", byteIndex: 6, bitIndex: 3 },
        ])
    ).toEqual([0, 7]);
});

it("should get bound if one var is inside the other", () => {
    expect(
        getBoundsOfVarSet([
            { area: "DB", type: "INT16", count: 10, byteIndex: 0 },
            { area: "DB", type: "INT16", byteIndex: 5 },
            { area: "DB", type: "BIT", byteIndex: 6, bitIndex: 3 },
        ])
    ).toEqual([0, 20]);
});

it("should get bounds if separate", () => {
    expect(
        getBoundsOfVarSet([
            { area: "DB", type: "INT16", count: 3, byteIndex: 7 },
            { area: "DB", type: "INT16", byteIndex: 12 },
            { area: "DB", type: "BIT", byteIndex: 101, bitIndex: 3 },
        ])
    ).toEqual([7, 102]);
});
