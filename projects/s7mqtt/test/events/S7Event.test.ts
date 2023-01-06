// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

/* eslint-disable @typescript-eslint/no-namespace */

import { ReadRequest, S7RemoteEndpoint, tS7Variable } from "@woifes/s7endpoint";
import { EventEmitter } from "events";
import { S7Event } from "../../src/events/S7Event";
import { S7Output } from "../../src/outputs/S7Output";
jest.mock("../../src/outputs/S7Output");
const S7OUT_MOCK = S7Output as unknown as jest.Mock;
S7OUT_MOCK.mockImplementation(() => {
    return new EventEmitter();
});

async function promiseTimeout(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeTagDecl(
                expected: Omit<tS7Variable, "name">
            ): CustomMatcherResult;
        }
    }
}

expect.extend({
    toBeTagDecl(
        received: Omit<tS7Variable, "name">,
        expected: tS7Variable
    ): jest.CustomMatcherResult {
        if (received.dbNr !== expected.dbNr) {
            return {
                pass: false,
                message: () =>
                    `dbNr ${received.dbNr} does not match with ${expected.dbNr}`,
            };
        }
        if (received.byteIndex !== expected.byteIndex) {
            return {
                pass: false,
                message: () =>
                    `byteIndex ${received.byteIndex} does not match with ${expected.byteIndex}`,
            };
        }
        if (received.type !== expected.type) {
            return {
                pass: false,
                message: () =>
                    `type ${received.type} does not match with ${expected.type}`,
            };
        }
        if (received.count !== expected.count) {
            return {
                pass: false,
                message: () =>
                    `count ${received.count} does not match with ${expected.count}`,
            };
        }
        if (Array.isArray(expected.value)) {
            if (
                !Array.isArray(received.value) ||
                expected.value.length !== received.value.length
            ) {
                return {
                    pass: false,
                    message: () =>
                        `${received.value} is no array, like ${expected.value}`,
                };
            } else {
                for (let i = 0; i < expected.value.length; i++) {
                    if (expected.value[i] !== received.value[i]) {
                        return {
                            pass: false,
                            message: () =>
                                `element ${i} ${
                                    (received.value as any)[i]
                                } does not match with ${
                                    (expected.value as any)[i]
                                }`,
                        };
                    }
                }
            }
        } else {
            if (received.value !== expected.value) {
                return {
                    pass: false,
                    message: () =>
                        `value ${received.value} does not match with ${expected.value}`,
                };
            }
        }
        return {
            pass: true,
            message: () => "",
        };
    },
});

const S7ENDP = new S7RemoteEndpoint({
    endpointIp: "127.0.0.1",
    name: "test01",
    rack: 10,
    slot: 1,
    selfRack: 20,
    selfSlot: 1,
});
const CREATE_READ_REQUEST_SPY = jest.spyOn(S7ENDP, "createReadRequest");

beforeEach(() => {
    jest.clearAllMocks();
});

it("should emit event on trigger", async () => {
    const evt = new S7Event(
        {
            trigger: "DB1,W4",
            params: ["DB12,DW0", "DB12,W4.3", "DB20,SInt2"],
            pollIntervalMS: 500,
        },
        S7ENDP
    );
    const OUT_MOCK: EventEmitter = (evt as any)._output;
    const TRG_KEY: symbol = (evt as any).TRIGGER_KEY;
    function simNewData(trg: number, a: number, b: number[], c: number) {
        const data: tS7Variable[] = [
            {
                area: "DB",
                dbNr: 1,
                byteIndex: 4,
                type: "UINT16",
                value: trg,
            },
        ];
        CREATE_READ_REQUEST_SPY.mockImplementation((tags: tS7Variable[]) => {
            return {
                execute: () => {
                    return Promise.resolve([
                        {
                            name: "1",
                            dbNr: 12,
                            byteIndex: 0,
                            type: "UINT32",
                            value: a,
                        },
                        {
                            name: "2",
                            dbNr: 12,
                            byteIndex: 4,
                            count: 3,
                            type: "INT16",
                            value: b,
                        },
                        {
                            name: "3",
                            dbNr: 20,
                            byteIndex: 2,
                            type: "INT8",
                            value: c,
                        },
                    ] as any);
                },
            } as ReadRequest;
        });
        OUT_MOCK.emit("data", data);
    }
    const trgCb = jest.fn();

    evt.on("trigger", trgCb);

    simNewData(0, 0, [1, 2, 3], 0);
    simNewData(1, 123, [10, 20, 30], 9);
    simNewData(1, 345, [11, 21, 31], 10);
    simNewData(3, 678, [-111, -211, -311], 11);
    await promiseTimeout(100);
    expect(trgCb).toBeCalledTimes(2);
    let [trg, params] = trgCb.mock.calls[0];
    expect(trg).toBeTagDecl({
        area: "DB",
        dbNr: 1,
        byteIndex: 4,
        type: "UINT16",
        value: 1,
    });
    expect(params[0]).toBeTagDecl({
        area: "DB",
        dbNr: 12,
        byteIndex: 0,
        type: "UINT32",
        value: 123,
    });
    expect(params[1]).toBeTagDecl({
        area: "DB",
        dbNr: 12,
        byteIndex: 4,
        count: 3,
        type: "INT16",
        value: [10, 20, 30],
    });
    expect(params[2]).toBeTagDecl({
        area: "DB",
        dbNr: 20,
        byteIndex: 2,
        type: "INT8",
        value: 9,
    });
    [trg, params] = trgCb.mock.calls[1];
    expect(trg).toBeTagDecl({
        area: "DB",
        dbNr: 1,
        byteIndex: 4,
        type: "UINT16",
        value: 3,
    });
    expect(params[0]).toBeTagDecl({
        area: "DB",
        dbNr: 12,
        byteIndex: 0,
        type: "UINT32",
        value: 678,
    });
    expect(params[1]).toBeTagDecl({
        area: "DB",
        dbNr: 12,
        byteIndex: 4,
        count: 3,
        type: "INT16",
        value: [-111, -211, -311],
    });
    expect(params[2]).toBeTagDecl({
        area: "DB",
        dbNr: 20,
        byteIndex: 2,
        type: "INT8",
        value: 11,
    });
});
