// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import EventEmitter from "events";
import { Client } from "@woifes/mqtt-client";
import { S7RemoteEndpoint } from "@woifes/s7endpoint";
import { TestServer } from "@woifes/s7endpoint/test/TestServer";
import debug from "debug";
import { LifeSign } from "../../src/lifesign/LifeSign";

process.env.TZ = "Europe/Berlin";
jest.setTimeout(10000);

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
    reconnectTimeMS: 300,
});
S7ENDP.connect();
class MqttClientMock extends EventEmitter {
    publishValueSync = jest.fn((topic: string, data: any) => {
        this.emit("publishedMessage");
        return Promise.resolve();
    });
}
const MQTT = new MqttClientMock();

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
                      "hex",
                  )}) is not the same as expected (${expected})`;

        return {
            message,
            pass,
        };
    },
});

describe("output tests", () => {
    let toggleInterval: NodeJS.Timer | undefined;
    let toggle = false;

    function startCycle() {
        toggle = false;
        toggleInterval = setInterval(() => {
            if (toggle) {
                SERVER.setArea(1, Buffer.from("10101010", "binary"));
            } else {
                SERVER.setArea(1, Buffer.from("01010101", "binary"));
            }
            toggle = !toggle;
        }, 500);
    }

    function endCycle() {
        if (toggleInterval !== undefined) {
            clearInterval(toggleInterval);
            toggleInterval = undefined;
        }
    }

    /* beforeEach(() => {
        startCycle();
    }); */

    it("should detect the output life sign correctly (BIT)", async () => {
        const LIFE_SIGN = new LifeSign(
            {
                out: {
                    address: "DB1,X0.0",
                    timeoutMS: 1000,
                    pollIntervalMS: 500,
                    topic: "a/b/c",
                },
            },
            S7ENDP,
            MQTT as unknown as Client,
            DEBUGGER,
        );
        await promiseTimeout(600);
        startCycle();
        await promiseTimeout(1800);
        expect(MQTT.publishValueSync).toBeCalledTimes(2);

        let [topic, data] = MQTT.publishValueSync.mock.calls[0];
        expect(data.lifeSign).toBe(0);

        [topic, data] = MQTT.publishValueSync.mock.calls[1];
        expect(data.lifeSign).toBe(1);

        jest.clearAllMocks();
        endCycle(); //stop the toggling
        await promiseTimeout(1800);

        expect(MQTT.publishValueSync).toBeCalledTimes(2);

        [topic, data] = MQTT.publishValueSync.mock.calls[0];
        expect(data.lifeSign).toBe(1);

        [topic, data] = MQTT.publishValueSync.mock.calls[1];
        expect(data.lifeSign).toBe(0);

        LIFE_SIGN.stopPolling();
        await promiseTimeout(800);
    });

    it("should detect the output life sign correctly (INT and not topic)", async () => {
        const LIFE_SIGN = new LifeSign(
            {
                out: {
                    address: "DB1,W0",
                    timeoutMS: 1000,
                    pollIntervalMS: 500,
                },
            },
            S7ENDP,
            MQTT as unknown as Client,
            DEBUGGER,
        );
        await promiseTimeout(600);
        startCycle();
        await promiseTimeout(1800);

        expect(LIFE_SIGN.lifeSign).toBe(true);

        jest.clearAllMocks();
        endCycle(); //stop the toggling
        await promiseTimeout(1800);

        expect(LIFE_SIGN.lifeSign).toBe(false);

        LIFE_SIGN.stopPolling();
        await promiseTimeout(800);
    });

    afterEach(() => {
        endCycle();
    });
});

describe("input tests", () => {
    it("should toggle the given target (BIT)", async () => {
        SERVER.setArea(2, Buffer.alloc(1));
        const LIFE_SIGN = new LifeSign(
            { in: { address: "DB2,X0.0", cycleMS: 500 } },
            S7ENDP,
            MQTT as unknown as Client,
            DEBUGGER,
        );

        expect(SERVER.getDbArea(2)).toBeBuffer("00");
        await promiseTimeout(550);
        expect(SERVER.getDbArea(2)).toBeBuffer("01");
        await promiseTimeout(550);
        expect(SERVER.getDbArea(2)).toBeBuffer("00");

        LIFE_SIGN.stopCycle();
        await promiseTimeout(550);
    });

    it("should toggle the given target (UNIT16)", async () => {
        SERVER.setArea(3, Buffer.alloc(2));
        const LIFE_SIGN = new LifeSign(
            { in: { address: "DB3,W0", cycleMS: 500 } },
            S7ENDP,
            MQTT as unknown as Client,
            DEBUGGER,
        );

        expect(SERVER.getDbArea(3)).toBeBuffer("0000");
        await promiseTimeout(550);
        expect(SERVER.getDbArea(3)).toBeBuffer("0001");
        await promiseTimeout(550);
        expect(SERVER.getDbArea(3)).toBeBuffer("0002");
        (LIFE_SIGN as any)._inSignValue = 2 ** 16 - 1; //Overflow test
        await promiseTimeout(550);
        expect(SERVER.getDbArea(3)).toBeBuffer("0000");

        LIFE_SIGN.stopCycle();
        await promiseTimeout(550);
    });
});
