// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { once } from "events";
import { S7RemoteEndpoint } from "@woifes/s7endpoint";
import { TestServer } from "@woifes/s7endpoint/test/TestServer";
import debug from "debug";
import { S7Output } from "../../src/outputs/S7Output";

async function promiseTimeout(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const DEBUGGER = debug("test");
const SERVER = new TestServer("127.0.0.1");
const S7ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
});
S7ENDP.connect();
afterAll(() => {
    SERVER.stop();
});

beforeEach(() => {
    jest.clearAllMocks();
});

it("should emit event on trigger", async () => {
    function setVariables(a: number, b: number, c: number[], d: number) {
        let buf = Buffer.alloc(10);
        buf.writeUInt16BE(a, 4);
        SERVER.setArea(1, buf);
        buf = Buffer.alloc(10);
        buf.writeUInt32BE(b, 0);
        buf.writeInt16BE(c[0], 4);
        buf.writeInt16BE(c[1], 6);
        buf.writeInt16BE(c[2], 8);
        SERVER.setArea(12, buf);
        buf = Buffer.alloc(10);
        buf.writeInt8(d, 2);
        SERVER.setArea(20, buf);
    }
    setVariables(1, 2, [3, 4, 5], 6);
    const oput = new S7Output(
        {
            tags: {
                a: "DB1,W4",
                b: "DB12,DW0",
                c: "DB12,I4.3",
                d: "DB20,SInt2",
            },
            pollIntervalMS: 500,
        },
        S7ENDP,
        DEBUGGER,
    );
    const dataCb = jest.fn();

    oput.on("data", dataCb);

    await promiseTimeout(200);
    setVariables(7, 8, [9, 10, 11], 12);
    await promiseTimeout(500);
    setVariables(13, 14, [15, 16, 17], 18);
    await promiseTimeout(500);
    setVariables(19, 20, [21, 22, 23], 24);

    oput.stopPolling();
    await once(oput, "pollingStopped");
    expect(dataCb.mock.calls.length).toBeGreaterThanOrEqual(4);
    let p = dataCb.mock.calls[0][0];
    expect(p[0]).toEqual({
        name: "a",
        area: "DB",
        dbNr: 1,
        byteIndex: 4,
        type: "UINT16",
        value: 1,
    });
    expect(p[1]).toEqual({
        name: "b",
        area: "DB",
        dbNr: 12,
        byteIndex: 0,
        type: "UINT32",
        value: 2,
    });
    expect(p[2]).toEqual({
        name: "c",
        area: "DB",
        dbNr: 12,
        byteIndex: 4,
        count: 3,
        type: "INT16",
        value: [3, 4, 5],
    });
    expect(p[3]).toEqual({
        name: "d",
        area: "DB",
        dbNr: 20,
        byteIndex: 2,
        type: "INT8",
        value: 6,
    });

    p = dataCb.mock.calls[1][0];
    expect(p[0]).toEqual({
        name: "a",
        area: "DB",
        dbNr: 1,
        byteIndex: 4,
        type: "UINT16",
        value: 7,
    });
    expect(p[1]).toEqual({
        name: "b",
        area: "DB",
        dbNr: 12,
        byteIndex: 0,
        type: "UINT32",
        value: 8,
    });
    expect(p[2]).toEqual({
        name: "c",
        area: "DB",
        dbNr: 12,
        byteIndex: 4,
        count: 3,
        type: "INT16",
        value: [9, 10, 11],
    });
    expect(p[3]).toEqual({
        name: "d",
        area: "DB",
        dbNr: 20,
        byteIndex: 2,
        type: "INT8",
        value: 12,
    });

    p = dataCb.mock.calls[2][0];
    expect(p[0]).toEqual({
        name: "a",
        area: "DB",
        dbNr: 1,
        byteIndex: 4,
        type: "UINT16",
        value: 13,
    });
    expect(p[1]).toEqual({
        name: "b",
        area: "DB",
        dbNr: 12,
        byteIndex: 0,
        type: "UINT32",
        value: 14,
    });
    expect(p[2]).toEqual({
        name: "c",
        area: "DB",
        dbNr: 12,
        byteIndex: 4,
        count: 3,
        type: "INT16",
        value: [15, 16, 17],
    });
    expect(p[3]).toEqual({
        name: "d",
        area: "DB",
        dbNr: 20,
        byteIndex: 2,
        type: "INT8",
        value: 18,
    });

    p = dataCb.mock.calls[3][0];
    expect(p[0]).toEqual({
        name: "a",
        area: "DB",
        dbNr: 1,
        byteIndex: 4,
        type: "UINT16",
        value: 19,
    });
    expect(p[1]).toEqual({
        name: "b",
        area: "DB",
        dbNr: 12,
        byteIndex: 0,
        type: "UINT32",
        value: 20,
    });
    expect(p[2]).toEqual({
        name: "c",
        area: "DB",
        dbNr: 12,
        byteIndex: 4,
        count: 3,
        type: "INT16",
        value: [21, 22, 23],
    });
    expect(p[3]).toEqual({
        name: "d",
        area: "DB",
        dbNr: 20,
        byteIndex: 2,
        type: "INT8",
        value: 24,
    });
});
