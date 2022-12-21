// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { once } from "events";
import { S7RemoteEndpoint } from "../../../src/remote";
import { AreaReadRequest } from "../../../src/request/areaRequest/AreaReadRequest";
import { tS7Variable } from "../../../src/types/S7Variable";
import { TestServer } from "../../TestServer";

const SERVER = new TestServer("127.0.0.1");
const S7ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
});

beforeAll(async () => {
    S7ENDP.connect();
    await once(S7ENDP, "connect");
});

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    S7ENDP.disconnect();
    SERVER.stop();
});

it("should read the variables as expected", async () => {
    const testVars: tS7Variable[] = [
        {
            name: "one",
            area: "DB",
            dbNr: 1,
            byteIndex: 45,
            type: "BIT",
            bitIndex: 6,
            count: 9,
        },
        {
            name: "two",
            area: "DB",
            dbNr: 1,
            byteIndex: 41,
            type: "BIT",
            bitIndex: 3,
        },
        {
            name: "three",
            area: "DB",
            dbNr: 1,
            byteIndex: 10,
            type: "INT16",
            count: 4,
        },
        { name: "four", area: "DB", dbNr: 1, byteIndex: 3, type: "INT32" },
        { name: "five", area: "DB", dbNr: 1, byteIndex: 1, type: "UINT8" },
    ];

    const buf = Buffer.alloc(47);
    buf.writeUInt8(123, 1); //test1
    buf.writeInt32BE(-1234, 3); //test2
    for (let i = 0; i < 4; i++) {
        buf.writeInt16BE(1000 * i + 1, 10 + i * 2); //test3
    }
    buf[41] = 0x8; //test4
    buf[45] = 170; //test5 //10101010
    buf[46] = 85; //test5 //01010101
    SERVER.setArea(1, buf);

    const dr = new AreaReadRequest(testVars, S7ENDP);
    const result = await dr.execute();
    expect(result).toEqual([
        {
            name: "one",
            dbNr: 1,
            area: "DB",
            byteIndex: 45,
            type: "BIT",
            bitIndex: 6,
            count: 9,
            value: [0, 1, 1, 0, 1, 0, 1, 0, 1],
        },
        {
            name: "two",
            dbNr: 1,
            area: "DB",
            byteIndex: 41,
            type: "BIT",
            bitIndex: 3,
            value: 1,
        },
        {
            name: "three",
            dbNr: 1,
            area: "DB",
            byteIndex: 10,
            type: "INT16",
            count: 4,
            value: [1, 1001, 2001, 3001],
        },
        {
            name: "four",
            dbNr: 1,
            area: "DB",
            byteIndex: 3,
            type: "INT32",
            value: -1234,
        },
        {
            name: "five",
            dbNr: 1,
            area: "DB",
            byteIndex: 1,
            type: "UINT8",
            value: 123,
        },
    ]);
});

it("should throw errors up to execute", () => {
    const testVars: tS7Variable[] = [
        { area: "DB", dbNr: 999, byteIndex: 1, type: "UINT8" },
        { area: "DB", dbNr: 999, byteIndex: 3, type: "INT32" },
        {
            area: "DB",
            dbNr: 999,
            byteIndex: 10,
            type: "INT16",
            count: 4,
        },
        { area: "DB", dbNr: 1, byteIndex: 41, type: "BIT", bitIndex: 3 },
        {
            area: "DB",
            dbNr: 999,
            byteIndex: 45,
            type: "BIT",
            bitIndex: 6,
            count: 9,
        },
    ];
    const dr = new AreaReadRequest(testVars, S7ENDP);
    expect(dr.execute()).rejects.toBeTruthy();
});
