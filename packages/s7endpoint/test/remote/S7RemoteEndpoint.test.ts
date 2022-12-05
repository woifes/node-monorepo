// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { once } from "events";
import { S7RemoteEndpoint } from "../../src/remote";
import { TestServer } from "../TestServer";

/* eslint-disable no-empty */

async function wait(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const SERVER = new TestServer("127.0.0.1");

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    endPoint.stop();
});

afterAll(() => {
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

const testConfig = {
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
};
let endPoint: S7RemoteEndpoint;

describe("creation and connection tests", () => {
    beforeAll(() => {
        jest.useFakeTimers();
    });

    afterAll(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    const connectCb = jest.fn();
    const disconnectCb = jest.fn();

    it("should create and setup client", async () => {
        endPoint = new S7RemoteEndpoint(testConfig);
        endPoint.on("connect", connectCb);
        endPoint.on("disconnect", disconnectCb);
        endPoint.connect();

        if (!endPoint.connected) {
            await once(endPoint, "connect");
        }
        expect(connectCb).toBeCalledTimes(1);
        expect(endPoint.connected).toBe(true);
    });

    it("should do nothing after first connect fails and no reconnect time is set", async () => {
        endPoint = new S7RemoteEndpoint(testConfig);
        endPoint.on("connect", connectCb);
        endPoint.on("disconnect", disconnectCb);
        const clientConnectSpy = jest.spyOn(
            (endPoint as any)._client,
            "Connect"
        );
        clientConnectSpy.mockImplementation((cb: any) => {
            cb(123);
        });
        endPoint.connect();

        expect(connectCb).not.toBeCalled();
        expect(clientConnectSpy).toBeCalledTimes(1);
        jest.runOnlyPendingTimers();
        expect(connectCb).not.toBeCalled();
        expect(clientConnectSpy).toBeCalledTimes(1);
    });

    it("should try to reconnect when reconnect time is set (and not retrigger)", async () => {
        endPoint = new S7RemoteEndpoint({
            reconnectTimeMS: 1000,
            ...testConfig,
        });
        endPoint.on("connect", connectCb);
        endPoint.on("disconnect", disconnectCb);
        const clientConnectSpy = jest.spyOn(
            (endPoint as any)._client,
            "Connect"
        );
        clientConnectSpy.mockImplementation((cb: any) => {
            cb(123);
        });
        endPoint.connect();
        expect(clientConnectSpy).toBeCalledTimes(1);
        expect(endPoint.connected).toBe(false);
        endPoint.connect();
        expect(clientConnectSpy).toBeCalledTimes(2);
        clientConnectSpy.mockImplementation((cb: any) => {
            cb();
        });
        jest.runOnlyPendingTimers();
        expect(clientConnectSpy).toBeCalledTimes(3); //if it would retrigger there would be 4 calls 2 inside test and 2 after timer run
    });

    it("should not try to reconnect when stopped", () => {
        endPoint = new S7RemoteEndpoint({
            reconnectTimeMS: 1000,
            ...testConfig,
        });
        endPoint.on("connect", connectCb);
        endPoint.on("disconnect", disconnectCb);
        const clientConnectSpy = jest.spyOn(
            (endPoint as any)._client,
            "Connect"
        );
        clientConnectSpy.mockImplementation((cb: any) => {
            cb(123);
        });
        endPoint.connect();
        expect(clientConnectSpy).toBeCalledTimes(1);
        expect(endPoint.connected).toBe(false);
        clientConnectSpy.mockImplementation((cb: any) => {
            cb();
        });
        endPoint.stop();
        jest.runOnlyPendingTimers();
        expect(clientConnectSpy).toBeCalledTimes(1); //if it would retrigger there would be 4 calls 2 inside test and 2 after timer run
    });

    it("should disconnect when called and not reconnect when no reconnect time is set", async () => {
        endPoint = new S7RemoteEndpoint(testConfig);
        endPoint.on("connect", connectCb);
        endPoint.on("disconnect", disconnectCb);
        const clientConnectSpy = jest.spyOn(
            (endPoint as any)._client,
            "Connect"
        );
        const clientDisconnectSpy = jest.spyOn(
            (endPoint as any)._client,
            "Disconnect"
        );
        endPoint.connect();
        if (!endPoint.connected) {
            await once(endPoint, "connect");
        }
        endPoint.disconnect();
        expect(clientDisconnectSpy).toBeCalledTimes(1);
        expect(connectCb).toBeCalledTimes(1);
        expect(disconnectCb).toBeCalledTimes(1);
        jest.clearAllMocks();
        jest.runOnlyPendingTimers();
        expect(clientConnectSpy).not.toBeCalled();
    });

    it("should reconnect after manual disconnect if reconnect time is set", () => {
        endPoint = new S7RemoteEndpoint({
            reconnectTimeMS: 1000,
            ...testConfig,
        });
        endPoint.on("connect", connectCb);
        endPoint.on("disconnect", disconnectCb);
        const clientConnectSpy = jest.spyOn(
            (endPoint as any)._client,
            "Connect"
        );
        clientConnectSpy.mockImplementation((cb: any) => {
            cb();
        });
        const clientDisconnectSpy = jest.spyOn(
            (endPoint as any)._client,
            "Disconnect"
        );
        endPoint.connect();
        endPoint.disconnect();
        expect(clientDisconnectSpy).toBeCalledTimes(1);
        expect(disconnectCb).toBeCalledTimes(1);
        jest.clearAllMocks();
        jest.runOnlyPendingTimers();
        expect(clientConnectSpy).toBeCalledTimes(1);
    });

    it("should not reconnect when stopped during connection", () => {
        endPoint = new S7RemoteEndpoint({
            reconnectTimeMS: 1000,
            ...testConfig,
        });
        endPoint.on("connect", connectCb);
        endPoint.on("disconnect", disconnectCb);
        const clientConnectSpy = jest.spyOn(
            (endPoint as any)._client,
            "Connect"
        );
        clientConnectSpy.mockImplementation((cb: any) => {
            cb();
        });
        const clientDisconnectSpy = jest.spyOn(
            (endPoint as any)._client,
            "Disconnect"
        );
        const clientConnectedSpy = jest.spyOn(
            (endPoint as any)._client,
            "Connected"
        );
        clientConnectedSpy.mockImplementation(() => true);
        endPoint.connect();
        endPoint.stop();
        expect(clientDisconnectSpy).toBeCalledTimes(1);
        expect(disconnectCb).toBeCalledTimes(1);
        jest.clearAllMocks();
        jest.runOnlyPendingTimers();
        expect(clientConnectSpy).not.toBeCalled();
    });
});

describe("client operations", () => {
    beforeEach(async () => {
        endPoint = new S7RemoteEndpoint(testConfig);
        endPoint.connect();
        if (!endPoint.connected) {
            await once(endPoint, "connect");
        }
    });

    describe("read opertions", () => {
        describe("readAreaBytes tests", () => {
            it("should  DBRead from client", async () => {
                if (!endPoint.connected) {
                    await once(endPoint, "connect");
                }
                SERVER.setArea(101, Buffer.from("0102030405", "hex"));
                expect(
                    await endPoint.readAreaBytes("DB", 101, 2, 3)
                ).toBeBuffer("030405");
            });

            it("should reject if error is set", async () => {
                //db does not exist
                try {
                    await endPoint.readAreaBytes("DB", 7, 2, 3);
                    fail("should throw");
                } catch {}
            });

            it("should reject if client is not connected", async () => {
                endPoint.stop();
                try {
                    await endPoint.readAreaBytes("DB", 1, 2, 3);
                    fail("should throw");
                } catch {}
            });

            it("should reject if byte count of response is not correct", async () => {
                const dbReadSpy = jest.spyOn(
                    (endPoint as any)._client,
                    "DBRead"
                );
                dbReadSpy.mockImplementation((cb: any) => {
                    cb(undefined, Buffer.alloc(4));
                });
                try {
                    await endPoint.readAreaBytes("DB", 1, 2, 3);
                    fail("should throw");
                } catch {}
            });
        });

        describe("readMulitVars tests", () => {
            it("should delegate the call correctly", async () => {
                SERVER.setArea(
                    1,
                    Buffer.from(
                        "01020A0B0C0D0708090A0102030405060708090A",
                        "hex"
                    )
                );
                SERVER.setArea(
                    4,
                    Buffer.from(
                        "0102030A05060708090A0F02030405060708090A",
                        "hex"
                    )
                );
                SERVER.setArea(
                    7,
                    Buffer.from(
                        "010203047A060708090A01020304057B0708090A",
                        "hex"
                    )
                );

                const result = await endPoint.readMultiVars([
                    { Area: 132, WordLen: 6, DBNumber: 1, Start: 2, Amount: 1 },
                    { Area: 132, WordLen: 6, DBNumber: 4, Start: 3, Amount: 2 },
                    { Area: 132, WordLen: 6, DBNumber: 7, Start: 4, Amount: 3 },
                ]);
                expect(result[0].Result).toBe(0);
                expect(result[1].Result).toBe(0);
                expect(result[2].Result).toBe(0);
                expect(result[0].Data).toBeBuffer("0A0B0C0D");
                expect(result[1].Data).toBeBuffer("0A05060708090A0F");
                expect(result[2].Data).toBeBuffer("7A060708090A01020304057B");
            });

            it("should reject if error is set", async () => {
                try {
                    await endPoint.readMultiVars([
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 2,
                            Start: 2,
                            Amount: 3,
                        },
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 5,
                            Start: 5,
                            Amount: 6,
                        },
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 9,
                            Start: 8,
                            Amount: 9,
                        },
                    ]);
                    fail("Should throw");
                } catch {}
            });

            it("should reject if client is not connected", async () => {
                SERVER.setArea(
                    1,
                    Buffer.from(
                        "0102030405060708090A0102030405060708090A",
                        "hex"
                    )
                );
                SERVER.setArea(
                    4,
                    Buffer.from(
                        "0102030405060708090A0102030405060708090A",
                        "hex"
                    )
                );
                SERVER.setArea(
                    7,
                    Buffer.from(
                        "0102030405060708090A0102030405060708090A",
                        "hex"
                    )
                );

                endPoint.stop();
                try {
                    await endPoint.readMultiVars([
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 1,
                            Start: 2,
                            Amount: 1,
                        },
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 4,
                            Start: 3,
                            Amount: 2,
                        },
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 7,
                            Start: 4,
                            Amount: 3,
                        },
                    ]);
                    fail("Should throw");
                } catch {}
            });
        });
    });

    describe("write operations", () => {
        describe("writeAreaBytes tests", () => {
            it("should write correctly", async () => {
                SERVER.setArea(1000, Buffer.from("FFFFFFFFFFFF", "hex"));

                await endPoint.writeAreaBytes("DB", 1000, 2, Buffer.alloc(3));

                expect(SERVER.getDbArea(1000)).toBeBuffer("FFFF000000FF");
            });

            it("should reject if error is set", async () => {
                //DB does not exist
                try {
                    await endPoint.writeAreaBytes(
                        "DB",
                        1001,
                        2,
                        Buffer.alloc(3)
                    );
                    fail("should throw");
                } catch {}
            });

            it("should reject if client is not connected", async () => {
                endPoint.stop();
                try {
                    await endPoint.writeAreaBytes(
                        "DB",
                        1000,
                        2,
                        Buffer.alloc(3)
                    );
                    fail("should throw");
                } catch {}
            });
        });

        describe("writeMulitVars tests", () => {
            it("should delegate the call correctly", async () => {
                SERVER.setArea(
                    1101,
                    Buffer.from("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", "hex")
                );
                SERVER.setArea(
                    1102,
                    Buffer.from("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", "hex")
                );
                SERVER.setArea(
                    1103,
                    Buffer.from("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", "hex")
                );

                const result = await endPoint.writeMultiVars([
                    {
                        Area: 132,
                        WordLen: 6,
                        DBNumber: 1101,
                        Start: 0,
                        Amount: 1,
                        Data: Buffer.alloc(4),
                    },
                    {
                        Area: 132,
                        WordLen: 6,
                        DBNumber: 1102,
                        Start: 1,
                        Amount: 2,
                        Data: Buffer.alloc(8),
                    },
                    {
                        Area: 132,
                        WordLen: 6,
                        DBNumber: 1103,
                        Start: 2,
                        Amount: 3,
                        Data: Buffer.alloc(12),
                    },
                ]);
                expect(result[0].Result).toBe(0);
                expect(result[1].Result).toBe(0);
                expect(result[2].Result).toBe(0);

                expect(SERVER.getDbArea(1101)).toBeBuffer(
                    "00000000FFFFFFFFFFFFFFFFFFFFFF"
                );
                expect(SERVER.getDbArea(1102)).toBeBuffer(
                    "FF0000000000000000FFFFFFFFFFFF"
                );
                expect(SERVER.getDbArea(1103)).toBeBuffer(
                    "FFFF000000000000000000000000FF"
                );
            });

            it("should reject if error is set", async () => {
                try {
                    const result = await endPoint.writeMultiVars([
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 1201,
                            Start: 0,
                            Amount: 1,
                            Data: Buffer.alloc(4),
                        },
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 1202,
                            Start: 1,
                            Amount: 2,
                            Data: Buffer.alloc(8),
                        },
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 1203,
                            Start: 2,
                            Amount: 3,
                            Data: Buffer.alloc(12),
                        },
                    ]);
                    fail("should throw");
                } catch {}
            });

            it("should reject if client is not connected", async () => {
                endPoint.stop();
                try {
                    const result = await endPoint.writeMultiVars([
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 1101,
                            Start: 0,
                            Amount: 1,
                            Data: Buffer.alloc(4),
                        },
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 1102,
                            Start: 1,
                            Amount: 2,
                            Data: Buffer.alloc(8),
                        },
                        {
                            Area: 132,
                            WordLen: 6,
                            DBNumber: 1103,
                            Start: 2,
                            Amount: 3,
                            Data: Buffer.alloc(12),
                        },
                    ]);
                    fail("should throw");
                } catch {}
            });
        });
    });
});
