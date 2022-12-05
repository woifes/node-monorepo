// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { once } from "events";
import { S7RemoteEndpoint } from "../../../src/remote";
import { AreaWriteRequest } from "../../../src/request/areaRequest/AreaWriteRequest";
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

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeBuffer(expected: string): CustomMatcherResult;
        }
    }
}

expect.extend({
    toBeBuffer(received: Buffer, expected: string): jest.CustomMatcherResult {
        const pass: boolean = received.equals(Buffer.from(expected, "hex"));
        const message: () => string = () =>
            pass
                ? ""
                : `Received Buffer (${received.toString(
                      "hex"
                  )}) is not the same as expected (${expected})`;

        return {
            message,
            pass,
        };
    },
});

describe("creation tests", () => {
    it("should throw if no value is set", () => {
        expect(() => {
            new AreaWriteRequest(
                [{ area: "DB", type: "UINT8", byteIndex: 1 }],
                S7ENDP
            );
        }).toThrow();
    });
});

describe("write bit variable tests", () => {
    describe("BIT tests", () => {
        let testVars: tS7Variable[];
        beforeEach(() => {
            testVars = [
                { area: "DB", dbNr: 1, type: "BIT", byteIndex: 1, bitIndex: 4 },
                { area: "DB", dbNr: 1, type: "BIT", byteIndex: 1, bitIndex: 5 },
                { area: "DB", dbNr: 1, type: "BIT", byteIndex: 1, bitIndex: 6 },
            ];
        });

        it("should set bit correctly", async () => {
            SERVER.setArea(1, Buffer.alloc(3));

            testVars[0].value = 1;
            testVars[1].value = 1;
            testVars[2].value = 1;
            const wr: AreaWriteRequest = new AreaWriteRequest(testVars, S7ENDP); //1
            await wr.execute();
            expect(SERVER.getDbArea(1)).toBeBuffer("007000");
        });

        it("should unset bit correctly", async () => {
            SERVER.setArea(2, Buffer.from("FFFFFF", "hex"));

            testVars[0].value = 0;
            testVars[0].dbNr = 2;
            testVars[1].value = 0;
            testVars[1].dbNr = 2;
            testVars[2].value = 0;
            testVars[2].dbNr = 2;
            const wr: AreaWriteRequest = new AreaWriteRequest(testVars, S7ENDP); //2
            await wr.execute();
            expect(SERVER.getDbArea(2)).toBeBuffer("FF8FFF");
        });

        it("should toggle bit", async () => {
            SERVER.setArea(3, Buffer.from("AA55AAAA", "hex"));

            testVars[0].value = 2;
            testVars[0].dbNr = 3;
            testVars[1].value = 2;
            testVars[1].dbNr = 3;
            testVars[2].value = 2;
            testVars[2].dbNr = 3;
            testVars[3] = {
                area: "DB",
                dbNr: 3,
                type: "UINT8",
                byteIndex: 3,
                value: 123,
            };
            const wr: AreaWriteRequest = new AreaWriteRequest(testVars, S7ENDP); //3
            await wr.execute();
            expect(SERVER.getDbArea(3)).toBeBuffer("AA25AA7B");
        });
    });

    describe("ARRAY_OF_BIT tests", () => {
        let testVars: tS7Variable[];
        beforeEach(() => {
            testVars = [
                {
                    area: "DB",
                    dbNr: 10,
                    type: "BIT",
                    byteIndex: 1,
                    bitIndex: 5,
                },
            ];
        });
        it("should set and toggle bits correctly", async () => {
            SERVER.setArea(10, Buffer.from("AAAAAA0000", "hex"));

            testVars[0].value = [1, 1, 2, 2, 0, 0];
            testVars[0].count = (testVars[0].value as any).length;
            testVars[1] = {
                area: "DB",
                dbNr: 10,
                type: "UINT8",
                byteIndex: 4,
                value: 123,
            };
            const wr: AreaWriteRequest = new AreaWriteRequest(testVars, S7ENDP); //10
            await wr.execute();

            expect(SERVER.getDbArea(10)).toBeBuffer("AA6AA9007B");
        });
    });
});

describe("write tests", () => {
    it("should work with byte var on start interrupted by space", async () => {
        SERVER.setArea(101, Buffer.alloc(27));

        const testVars: tS7Variable[] = [
            { area: "DB", dbNr: 101, byteIndex: 1, type: "UINT8", value: 123 },
            { area: "DB", dbNr: 101, byteIndex: 2, type: "INT32", value: 456 },
            { area: "DB", dbNr: 101, byteIndex: 6, type: "UINT16", value: 78 },

            {
                area: "DB",
                dbNr: 101,
                byteIndex: 10,
                type: "INT32",
                count: 3,
                value: [1, 2, 3],
            },
            { area: "DB", dbNr: 101, byteIndex: 22, type: "INT32", value: 456 },
        ];

        const wr = new AreaWriteRequest(testVars, S7ENDP); //101
        await wr.execute();
        expect(SERVER.getDbArea(101)).toBeBuffer(
            "007b000001c8004e0000000000010000000200000003000001c800"
        );
    });

    it("should work with no continous variables", async () => {
        SERVER.setArea(102, Buffer.alloc(30));

        const testVars: tS7Variable[] = [
            { area: "DB", dbNr: 102, byteIndex: 1, type: "UINT8", value: 123 },

            {
                area: "DB",
                dbNr: 102,
                byteIndex: 10,
                type: "INT32",
                count: 3,
                value: [1, 2, 3],
            },

            { area: "DB", dbNr: 102, byteIndex: 25, type: "INT32", value: 456 },
        ];

        const wr = new AreaWriteRequest(testVars, S7ENDP); //102
        await wr.execute();
        expect(SERVER.getDbArea(102)).toBeBuffer(
            "007b0000000000000000000000010000000200000003000000000001c800"
        );
    });

    it("should work with byte var interrupted by bit var", async () => {
        SERVER.setArea(103, Buffer.alloc(26));

        const testVars: tS7Variable[] = [
            { area: "DB", dbNr: 103, byteIndex: 1, type: "UINT8", value: 123 },
            { area: "DB", dbNr: 103, byteIndex: 2, type: "INT32", value: 456 },
            { area: "DB", dbNr: 103, byteIndex: 6, type: "UINT16", value: 78 },
            {
                area: "DB",
                dbNr: 103,
                byteIndex: 8,
                bitIndex: 4,
                type: "BIT",
                value: 2,
            },
            {
                area: "DB",
                dbNr: 103,
                byteIndex: 9,
                type: "INT32",
                count: 3,
                value: [1, 2, 3],
            },
            { area: "DB", dbNr: 103, byteIndex: 21, type: "INT32", value: 456 },
        ];

        const wr = new AreaWriteRequest(testVars, S7ENDP); //103
        await wr.execute();
        expect(SERVER.getDbArea(103)).toBeBuffer(
            "007b000001c8004e10000000010000000200000003000001c800"
        );
    });
});
