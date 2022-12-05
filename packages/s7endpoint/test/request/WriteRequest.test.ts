// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { S7RemoteEndpoint } from "../../src/remote";
import { WriteRequest } from "../../src/request";
import { AreaWriteRequest } from "../../src/request/areaRequest/AreaWriteRequest";
import { tS7Variable } from "../../src/types/S7Variable";
jest.mock("../../src/request/areaRequest/AreaWriteRequest");

const S7ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
});

const testTagSet: tS7Variable[] = [
    { area: "DB", value: 1, dbNr: 1, byteIndex: 1, type: "UINT8" },
    { area: "DB", value: 1, dbNr: 2, byteIndex: 1, type: "UINT8" },
    { area: "DB", value: 1, dbNr: 3, byteIndex: 1, type: "UINT8" },
    { area: "DB", value: 1, dbNr: 3, byteIndex: 4, type: "UINT8" },
    { area: "DB", value: 1, dbNr: 3, byteIndex: 12, type: "UINT8" },
    { area: "DB", value: 1, dbNr: 4, byteIndex: 1, type: "UINT8" },
    { area: "DB", value: 1, dbNr: 7, byteIndex: 1, type: "UINT8" },
];

afterEach(() => {
    jest.clearAllMocks();
});

it("create AreaWriteRequest for each db", () => {
    const wr = new WriteRequest(testTagSet, S7ENDP);
    expect(AreaWriteRequest).toBeCalledTimes(5);
    expect((AreaWriteRequest as jest.Mock).mock.calls[0][0]).toEqual([
        { area: "DB", value: 1, dbNr: 1, byteIndex: 1, type: "UINT8" },
    ]);
    expect((AreaWriteRequest as jest.Mock).mock.calls[1][0]).toEqual([
        { area: "DB", value: 1, dbNr: 2, byteIndex: 1, type: "UINT8" },
    ]);
    expect((AreaWriteRequest as jest.Mock).mock.calls[2][0]).toEqual([
        { area: "DB", value: 1, dbNr: 3, byteIndex: 1, type: "UINT8" },
        { area: "DB", value: 1, dbNr: 3, byteIndex: 4, type: "UINT8" },
        { area: "DB", value: 1, dbNr: 3, byteIndex: 12, type: "UINT8" },
    ]);
    expect((AreaWriteRequest as jest.Mock).mock.calls[3][0]).toEqual([
        { area: "DB", value: 1, dbNr: 4, byteIndex: 1, type: "UINT8" },
    ]);
    expect((AreaWriteRequest as jest.Mock).mock.calls[4][0]).toEqual([
        { area: "DB", value: 1, dbNr: 7, byteIndex: 1, type: "UINT8" },
    ]);
});

describe("delegation tests", () => {
    it("should delegate the call to all AreaWriteRequests", () => {
        const wr = new WriteRequest(testTagSet, S7ENDP);
        expect(AreaWriteRequest).toBeCalledTimes(5);
        for (let i = 0; i < (wr as any)._areaRequests.length; i++) {
            (wr as any)._areaRequests[i].execute.mockImplementation(() => {
                return Promise.resolve();
            });
        }
        expect(wr.execute()).resolves.toBeTruthy();
        for (let i = 0; i < (wr as any)._areaRequests.length; i++) {
            expect((wr as any)._areaRequests[i].execute).toBeCalledTimes(1);
        }
    });

    it("should delegate the call to all AreaWriteRequests", () => {
        const wr = new WriteRequest(testTagSet, S7ENDP);
        expect(AreaWriteRequest).toBeCalledTimes(5);
        for (let i = 0; i < (wr as any)._areaRequests.length; i++) {
            (wr as any)._areaRequests[i].execute.mockImplementation(() => {
                return Promise.resolve();
            });
        }
        (wr as any)._areaRequests[2].execute.mockImplementation(() => {
            return Promise.reject("Error");
        });
        expect(wr.execute()).rejects.toBeTruthy();
    });
});
