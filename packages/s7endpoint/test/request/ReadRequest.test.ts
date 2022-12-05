// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { S7RemoteEndpoint } from "../../src/remote";
import { ReadRequest } from "../../src/request";
import { AreaReadRequest } from "../../src/request/areaRequest/AreaReadRequest";
import { tS7Variable } from "../../src/types/S7Variable";
jest.mock("../../src/request/areaRequest/AreaReadRequest");

const S7ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
});

const testTagSet: tS7Variable[] = [
    { area: "DB", dbNr: 1, byteIndex: 1, type: "UINT8" },
    { area: "DB", dbNr: 2, byteIndex: 1, type: "UINT8" },
    { name: "one", area: "DB", dbNr: 3, byteIndex: 1, type: "UINT8" },
    { area: "DB", dbNr: 4, byteIndex: 1, type: "UINT8" },
    { name: "two", area: "DB", dbNr: 3, byteIndex: 4, type: "UINT8" },
    { area: "DB", dbNr: 7, byteIndex: 1, type: "UINT8" },
    { name: "three", area: "DB", dbNr: 3, byteIndex: 12, type: "UINT8" },
];

afterEach(() => {
    jest.clearAllMocks();
});

it("create DbReadRequest for each db", () => {
    const rr = new ReadRequest(testTagSet, S7ENDP);
    expect(AreaReadRequest).toBeCalledTimes(5);
    expect((AreaReadRequest as jest.Mock).mock.calls[0][0]).toEqual([
        { area: "DB", dbNr: 1, byteIndex: 1, type: "UINT8" },
    ]);
    expect((AreaReadRequest as jest.Mock).mock.calls[1][0]).toEqual([
        { area: "DB", dbNr: 2, byteIndex: 1, type: "UINT8" },
    ]);
    expect((AreaReadRequest as jest.Mock).mock.calls[2][0]).toEqual([
        { name: "one", area: "DB", dbNr: 3, byteIndex: 1, type: "UINT8" },
        { name: "two", area: "DB", dbNr: 3, byteIndex: 4, type: "UINT8" },
        { name: "three", area: "DB", dbNr: 3, byteIndex: 12, type: "UINT8" },
    ]);
    expect((AreaReadRequest as jest.Mock).mock.calls[3][0]).toEqual([
        { area: "DB", dbNr: 4, byteIndex: 1, type: "UINT8" },
    ]);
    expect((AreaReadRequest as jest.Mock).mock.calls[4][0]).toEqual([
        { area: "DB", dbNr: 7, byteIndex: 1, type: "UINT8" },
    ]);
});

describe("Delegation tests", () => {
    it("should merge the result objects", async () => {
        const rr = new ReadRequest(testTagSet, S7ENDP);
        expect(AreaReadRequest).toBeCalledTimes(5);
        (
            (rr as any)._areaRequests.get("DB1").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.resolve([
                { area: "DB", dbNr: 1, byteIndex: 1, type: "UINT8", value: 1 },
            ]);
        });
        (
            (rr as any)._areaRequests.get("DB2").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.resolve([
                { area: "DB", dbNr: 2, byteIndex: 1, type: "UINT8", value: 2 },
            ]);
        });
        (
            (rr as any)._areaRequests.get("DB3").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.resolve([
                {
                    name: "one",
                    area: "DB",
                    dbNr: 3,
                    byteIndex: 1,
                    type: "UINT8",
                    value: 3,
                },
                {
                    name: "two",
                    area: "DB",
                    dbNr: 3,
                    byteIndex: 4,
                    type: "UINT8",
                    value: 4,
                },
                {
                    name: "three",
                    area: "DB",
                    dbNr: 3,
                    byteIndex: 12,
                    type: "UINT8",
                    value: 5,
                },
            ]);
        });
        (
            (rr as any)._areaRequests.get("DB4").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.resolve([
                { area: "DB", dbNr: 4, byteIndex: 1, type: "UINT8", value: 6 },
            ]);
        });
        (
            (rr as any)._areaRequests.get("DB7").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.resolve([
                { area: "DB", dbNr: 7, byteIndex: 1, type: "UINT8", value: 7 },
            ]);
        });

        const result = await rr.execute();
        expect(result).toEqual([
            { area: "DB", dbNr: 1, byteIndex: 1, type: "UINT8", value: 1 },
            { area: "DB", dbNr: 2, byteIndex: 1, type: "UINT8", value: 2 },
            {
                name: "one",
                area: "DB",
                dbNr: 3,
                byteIndex: 1,
                type: "UINT8",
                value: 3,
            },
            { area: "DB", dbNr: 4, byteIndex: 1, type: "UINT8", value: 6 },
            {
                name: "two",
                area: "DB",
                dbNr: 3,
                byteIndex: 4,
                type: "UINT8",
                value: 4,
            },
            { area: "DB", dbNr: 7, byteIndex: 1, type: "UINT8", value: 7 },
            {
                name: "three",
                area: "DB",
                dbNr: 3,
                byteIndex: 12,
                type: "UINT8",
                value: 5,
            },
        ]);
    });

    it("should reject if one promise rejects", async () => {
        const rr = new ReadRequest(testTagSet, S7ENDP);
        expect(AreaReadRequest).toBeCalledTimes(5);
        (
            (rr as any)._areaRequests.get("DB1").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.resolve([
                { area: "DB", dbNr: 1, byteIndex: 1, type: "UINT8", value: 1 },
            ]);
        });
        (
            (rr as any)._areaRequests.get("DB2").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.resolve([
                { area: "DB", dbNr: 2, byteIndex: 1, type: "UINT8", value: 2 },
            ]);
        });
        (
            (rr as any)._areaRequests.get("DB3").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.reject("Some Error");
        });
        (
            (rr as any)._areaRequests.get("DB4").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.resolve([
                { area: "DB", dbNr: 4, byteIndex: 1, type: "UINT8", value: 6 },
            ]);
        });
        (
            (rr as any)._areaRequests.get("DB7").execute as jest.Mock
        ).mockImplementationOnce(() => {
            return Promise.resolve([
                { area: "DB", dbNr: 7, byteIndex: 1, type: "UINT8", value: 7 },
            ]);
        });

        try {
            await rr.execute();
            throw new Error("Should throw exception");
            /* eslint-disable-next-line no-empty */
        } catch (e) {
            expect(e).toEqual("Some Error");
        }
    });
});
