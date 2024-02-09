// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { combineContAddresses } from "../../../src/request";
import { tS7Address } from "../../../src/types/S7Address";

it("should combine fitting variables", () => {
    const varSet: tS7Address[] = [
        {
            area: "DB",
            type: "INT16",
            count: 3,
            byteIndex: 0,
        },
        {
            area: "DB",
            type: "INT16",
            byteIndex: 6,
        },
        {
            area: "DB",
            type: "BIT",
            byteIndex: 8,
            bitIndex: 3,
        },
        {
            area: "DB",
            type: "BIT",
            byteIndex: 14,
            bitIndex: 6,
            count: 19,
        },
        {
            area: "DB",
            type: "UINT16",
            byteIndex: 18,
        },
        {
            area: "DB",
            type: "UINT32",
            byteIndex: 24,
        },
    ];
    const spread = combineContAddresses(varSet);
    expect(spread).toEqual([
        [
            {
                area: "DB",
                type: "INT16",
                count: 3,
                byteIndex: 0,
            },
            {
                area: "DB",
                type: "INT16",
                byteIndex: 6,
            },
            {
                area: "DB",
                type: "BIT",
                byteIndex: 8,
                bitIndex: 3,
            },
        ],
        [
            {
                area: "DB",
                type: "BIT",
                byteIndex: 14,
                bitIndex: 6,
                count: 19,
            },
            {
                area: "DB",
                type: "UINT16",
                byteIndex: 18,
            },
        ],
        [
            {
                area: "DB",
                type: "UINT32",
                byteIndex: 24,
            },
        ],
    ]);
});

it("should combine variables which overlap", () => {
    const varSet: tS7Address[] = [
        {
            area: "DB",
            type: "INT16",
            count: 3,
            byteIndex: 0,
        },
        {
            area: "DB",
            type: "INT16",
            byteIndex: 5,
        },
        {
            area: "DB",
            type: "BIT",
            byteIndex: 6,
            bitIndex: 3,
        },
        {
            area: "DB",
            type: "BIT",
            byteIndex: 14,
            bitIndex: 6,
            count: 19,
        },
        {
            area: "DB",
            type: "UINT16",
            byteIndex: 17,
        },
        {
            area: "DB",
            type: "UINT32",
            byteIndex: 24,
        },
    ];
    const spread = combineContAddresses(varSet);
    expect(spread).toEqual([
        [
            {
                area: "DB",
                type: "INT16",
                count: 3,
                byteIndex: 0,
            },
            {
                area: "DB",
                type: "INT16",
                byteIndex: 5,
            },
            {
                area: "DB",
                type: "BIT",
                byteIndex: 6,
                bitIndex: 3,
            },
        ],
        [
            {
                area: "DB",
                type: "BIT",
                byteIndex: 14,
                bitIndex: 6,
                count: 19,
            },
            {
                area: "DB",
                type: "UINT16",
                byteIndex: 17,
            },
        ],
        [
            {
                area: "DB",
                type: "UINT32",
                byteIndex: 24,
            },
        ],
    ]);
});

it("should combine variables if inside other variable", () => {
    const varSet: tS7Address[] = [
        {
            area: "DB",
            type: "INT16",
            count: 10,
            byteIndex: 0,
        },
        {
            area: "DB",
            type: "INT16",
            byteIndex: 6,
        },
        {
            area: "DB",
            type: "BIT",
            byteIndex: 8,
            bitIndex: 3,
        },
        {
            area: "DB",
            type: "BIT",
            byteIndex: 14,
            bitIndex: 6,
            count: 19,
        },
        {
            area: "DB",
            type: "UINT16",
            byteIndex: 18,
        },
        {
            area: "DB",
            type: "UINT32",
            byteIndex: 24,
        },
    ];
    const spread = combineContAddresses(varSet);
    expect(spread).toEqual([
        [
            {
                area: "DB",
                type: "INT16",
                count: 10,
                byteIndex: 0,
            },
            {
                area: "DB",
                type: "INT16",
                byteIndex: 6,
            },
            {
                area: "DB",
                type: "BIT",
                byteIndex: 8,
                bitIndex: 3,
            },
            {
                area: "DB",
                type: "BIT",
                byteIndex: 14,
                bitIndex: 6,
                count: 19,
            },
            {
                area: "DB",
                type: "UINT16",
                byteIndex: 18,
            },
        ],
        [
            {
                area: "DB",
                type: "UINT32",
                byteIndex: 24,
            },
        ],
    ]);
});
