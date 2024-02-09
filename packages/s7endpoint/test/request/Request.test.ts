// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { S7RemoteEndpoint } from "../../src/remote";
import { Request } from "../../src/request/Request";
import { tS7Address } from "../../src/types/S7Address";

const S7ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
});

it("should check tag array with runtype", () => {
    const tags: tS7Address[] = [
        {
            area: "DB",
            dbNr: 1,
            byteIndex: 1,
            type: "UINT8",
        },
        {
            dbNr: 1,
            byteIndex: 1,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 1,
            byteIndex: 1,
            type: "UINT8",
        },
    ] as tS7Address[];
    expect(() => {
        new Request(tags, S7ENDP);
    }).toThrow();
});

it("should sort tags and generate arrays for each db", () => {
    const tags: tS7Address[] = [
        {
            area: "DB",
            dbNr: 7,
            byteIndex: 1,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 3,
            byteIndex: 12,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 4,
            byteIndex: 1,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 3,
            byteIndex: 1,
            type: "UINT8",
        },
        {
            area: "M",
            byteIndex: 4,
            type: "UINT8",
        },
        {
            area: "M",
            byteIndex: 1,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 2,
            byteIndex: 1,
            type: "UINT8",
        },
    ];
    const r = new Request(tags, S7ENDP);
    expect((r as any)._variables).toEqual([
        {
            area: "DB",
            dbNr: 7,
            byteIndex: 1,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 3,
            byteIndex: 12,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 4,
            byteIndex: 1,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 3,
            byteIndex: 1,
            type: "UINT8",
        },
        {
            area: "M",
            byteIndex: 4,
            type: "UINT8",
        },
        {
            area: "M",
            byteIndex: 1,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 2,
            byteIndex: 1,
            type: "UINT8",
        },
    ]);

    const varsByArea = (r as any)._varsByArea as Map<string, tS7Address[]>;
    expect(Array.from(varsByArea.keys())).toEqual([
        "DB7",
        "DB3",
        "DB4",
        "M",
        "DB2",
    ]);
    expect(varsByArea.get("DB7")).toEqual([
        {
            area: "DB",
            dbNr: 7,
            byteIndex: 1,
            type: "UINT8",
        },
    ]);
    expect(varsByArea.get("DB3")).toEqual([
        {
            area: "DB",
            dbNr: 3,
            byteIndex: 12,
            type: "UINT8",
        },
        {
            area: "DB",
            dbNr: 3,
            byteIndex: 1,
            type: "UINT8",
        },
    ]);
    expect(varsByArea.get("DB4")).toEqual([
        {
            area: "DB",
            dbNr: 4,
            byteIndex: 1,
            type: "UINT8",
        },
    ]);
    expect(varsByArea.get("M")).toEqual([
        {
            area: "M",
            byteIndex: 4,
            type: "UINT8",
        },
        {
            area: "M",
            byteIndex: 1,
            type: "UINT8",
        },
    ]);
    expect(varsByArea.get("DB2")).toEqual([
        {
            area: "DB",
            dbNr: 2,
            byteIndex: 1,
            type: "UINT8",
        },
    ]);

    const indexesByArea = (r as any)._indexesByArea as Map<
        string,
        tS7Address[]
    >;
    expect(Array.from(indexesByArea.keys())).toEqual([
        "DB7",
        "DB3",
        "DB4",
        "M",
        "DB2",
    ]);
    expect(indexesByArea.get("DB7")).toEqual([0]);
    expect(indexesByArea.get("DB3")).toEqual([1, 3]);
    expect(indexesByArea.get("DB4")).toEqual([2]);
    expect(indexesByArea.get("M")).toEqual([4, 5]);
    expect(indexesByArea.get("DB2")).toEqual([6]);
});
