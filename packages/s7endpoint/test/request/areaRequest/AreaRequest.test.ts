// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { S7RemoteEndpoint } from "../../../src/remote";
import { AreaRequest } from "../../../src/request/areaRequest/AreaRequest";
import { tS7Variable } from "../../../src/types/S7Variable";

const S7ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
});

it("should check variable array with runtype", () => {
    const varSet: tS7Variable[] = [
        { area: "DB", byteIndex: 2, type: "UINT8" },
        { area: "DB", byteIndex: 13, type: "UINT8" },
        { area: "DB", byteIndex: 111, type: "UINT8" },
        { area: "DB", byteIndex: 250, type: "UINT8" },
        { area: "DB", byteIndex: 1000, type: "UINT8" },
        {
            area: "DB",
            byteIndex: 2010,
            type: "FLOAT",
            count: 12,
            name: "test",
        },
    ] as tS7Variable[];
    expect(() => {
        new AreaRequest(varSet, S7ENDP);
    }).toThrow();
});

it("should calc correct size", () => {
    const varSet: tS7Variable[] = [
        { area: "DB", dbNr: 1, byteIndex: 111, type: "UINT8" },
        { area: "DB", dbNr: 1, byteIndex: 2, type: "UINT8" },
        { area: "DB", dbNr: 1, byteIndex: 250, type: "UINT8" },
        { area: "DB", dbNr: 1, byteIndex: 13, type: "UINT8" },
        { area: "DB", dbNr: 1, byteIndex: 1000, type: "UINT8" },
        {
            area: "DB",
            dbNr: 1,
            byteIndex: 2010,
            type: "FLOAT",
            count: 12,
        },
    ];
    const dr = new AreaRequest(varSet, S7ENDP);
    expect((dr as any)._variables).toEqual([
        { area: "DB", dbNr: 1, byteIndex: 2, type: "UINT8" },
        { area: "DB", dbNr: 1, byteIndex: 13, type: "UINT8" },
        { area: "DB", dbNr: 1, byteIndex: 111, type: "UINT8" },
        { area: "DB", dbNr: 1, byteIndex: 250, type: "UINT8" },
        { area: "DB", dbNr: 1, byteIndex: 1000, type: "UINT8" },
        {
            area: "DB",
            dbNr: 1,
            byteIndex: 2010,
            type: "FLOAT",
            count: 12,
        },
    ]);
    expect((dr as any)._startIndex).toBe(2);
    expect(dr.length).toBe(2010 - 2 + 12 * 4);
});
