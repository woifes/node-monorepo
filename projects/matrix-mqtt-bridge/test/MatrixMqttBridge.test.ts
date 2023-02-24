// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client as MqttClient } from "@woifes/mqtt-client";
import { createClient as matrixCreateClient } from "matrix-js-sdk";
import { MatrixMqttBridge } from "../src/MatrixMqttBridge";
import { tMatrixMqttBridgeConfig } from "../src/MatrixMqttBridgeConfig";
jest.mock<typeof import("matrix-js-sdk")>("matrix-js-sdk", () => {
    return {
        __esModule: true,
        ...jest.requireActual("matrix-js-sdk"),
        createClient: jest.fn().mockImplementation(() => {
            return matrixClientMock;
        }),
    };
});

function wait(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

function generateMatrixRoomId(roomId: string): string {
    return `#${roomId}:matrix`;
}

const matrixCreateClientMock = matrixCreateClient as jest.Mock;
const matrixClientMock = {
    startClient: jest.fn(),
    login: jest.fn().mockImplementation(() => {
        return Promise.resolve();
    }),
    on: jest.fn(),
    getRoomIdForAlias: jest.fn(),
    createRoom: jest.fn().mockImplementation((options: any) => {
        return Promise.resolve({ room_id: generateMatrixRoomId(options.name) });
    }),
    joinRoom: jest.fn().mockImplementation(() => Promise.resolve()),
    sendTextMessage: jest.fn(),
};
const MqttClientMock = MqttClient as jest.Mock;

function createBridgeConfig(): tMatrixMqttBridgeConfig {
    return {
        mqtt: {
            url: "localhost",
            clientId: "client01", //without auth the client will not connect
        },

        matrix: {
            url: "localhost",
            userName: "user01",
            password: "abc",
        },

        bridge: {
            rooms: [],
        },
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("creation tests", () => {
    it("should create bridge and join and create required rooms", async () => {
        const config = createBridgeConfig();
        config.bridge.rooms = [
            { roomId: "room01" },
            { roomId: "room02", federate: false, public: false },
            { roomId: "room03", federate: true, public: false },
            { roomId: "room04", federate: false, public: true },
            { roomId: "room05", federate: false, public: false },
            { roomId: "room06", federate: false, public: false },
        ];
        matrixClientMock.getRoomIdForAlias.mockImplementation(
            (roomId: string) => {
                switch (roomId) {
                    case "#room01:localhost":
                    case "#room02:localhost":
                    case "#room03:localhost":
                    case "#room04:localhost":
                    case "#room05:localhost":
                        throw new Error("Room does not exist");
                    default:
                        return Promise.resolve({
                            room_id: generateMatrixRoomId("room06"),
                        });
                }
            }
        );
        const c = new MatrixMqttBridge(config);
        await wait(100);

        expect(matrixCreateClientMock).toBeCalledTimes(1);
        let calls = matrixCreateClientMock.mock.calls;
        expect(calls[0][0]).toEqual({
            baseUrl: "https://localhost",
        });

        expect(matrixClientMock.login).toBeCalledTimes(1);
        const [loginType, loginContent] = matrixClientMock.login.mock.calls[0];
        expect(loginType).toBe("m.login.password");
        expect(loginContent).toEqual({
            user: "@user01:localhost",
            password: "abc",
        });

        expect(matrixClientMock.getRoomIdForAlias).toBeCalledTimes(6);
        calls = matrixClientMock.getRoomIdForAlias.mock.calls;
        expect(calls[0][0]).toBe("#room01:localhost");
        expect(calls[1][0]).toBe("#room02:localhost");
        expect(calls[2][0]).toBe("#room03:localhost");
        expect(calls[3][0]).toBe("#room04:localhost");
        expect(calls[4][0]).toBe("#room05:localhost");
        expect(calls[5][0]).toBe("#room06:localhost");

        expect(matrixClientMock.createRoom).toBeCalledTimes(5);
        calls = matrixClientMock.createRoom.mock.calls;
        expect(calls[0][0]).toEqual({
            creation_content: {
                "m.federate": true,
            },
            name: "room01",
            room_alias_name: "room01",
            visibility: "public",
        });
        expect(calls[1][0]).toEqual({
            creation_content: {
                "m.federate": false,
            },
            name: "room02",
            room_alias_name: "room02",
            visibility: "private",
        });
        expect(calls[2][0]).toEqual({
            creation_content: {
                "m.federate": true,
            },
            name: "room03",
            room_alias_name: "room03",
            visibility: "private",
        });
        expect(calls[3][0]).toEqual({
            creation_content: {
                "m.federate": false,
            },
            name: "room04",
            room_alias_name: "room04",
            visibility: "public",
        });
        expect(calls[4][0]).toEqual({
            creation_content: {
                "m.federate": false,
            },
            name: "room05",
            room_alias_name: "room05",
            visibility: "private",
        });

        expect(matrixClientMock.joinRoom).toBeCalledTimes(6);
        calls = matrixClientMock.joinRoom.mock.calls;
        expect(calls[0][0]).toBe("#room01:matrix");
        expect(calls[1][0]).toBe("#room02:matrix");
        expect(calls[2][0]).toBe("#room03:matrix");
        expect(calls[3][0]).toBe("#room04:matrix");
        expect(calls[4][0]).toBe("#room05:matrix");
        expect(calls[5][0]).toBe("#room06:matrix");

        expect(matrixClientMock.on).toBeCalled();
        expect(matrixClientMock.on.mock.calls[0][0]).toBe("Room.timeline");
    });
});

describe("Incoming matrix message tests", () => {
    let c: MatrixMqttBridge;
    const publishValueMock = jest.fn();
    let onMatrixMessageHandler: any;
    let generateMatrixEvent: any;
    beforeEach(async () => {
        await createBridge();
    });

    function generateStdConfig(): tMatrixMqttBridgeConfig {
        const config = createBridgeConfig();
        config.bridge.rooms = [{ roomId: "room01" }];
        config.bridge.mqttTopicPrefix = "mtx";
        return config;
    }

    async function createBridge(config = generateStdConfig()) {
        c = new MatrixMqttBridge(config);
        await wait(100);
        (c as any)._mqttClient.publishValue = publishValueMock;
        onMatrixMessageHandler = matrixClientMock.on.mock.calls[0][1];
        generateMatrixEvent = (
            type: string,
            msgtype: string,
            body: string,
            roomId: string,
            userId: string,
            localTimestamp: number
        ) => {
            const event = {
                getType: () => type,
                getContent: () => {
                    return { msgtype, body };
                },
                getRoomId: () => roomId,
                localTimestamp,
                sender: {
                    userId,
                },
            };
            const fn = onMatrixMessageHandler;
            fn(event);
        };
    }

    describe("Text command test", () => {
        function sendTextMessage(message: string) {
            generateMatrixEvent(
                "m.room.message",
                "m.text",
                message,
                "#room01:matrix",
                "someoneelse",
                Date.now() + 1000 //give it 1s time to execute
            );
        }

        it("should display help", async () => {
            sendTextMessage("bridge help");
            await wait(100);
            expect(matrixClientMock.sendTextMessage).toBeCalledTimes(1);
            const [roomId, content] =
                matrixClientMock.sendTextMessage.mock.calls[0];
            expect(roomId).toBe("#room01:matrix");
            expect(content).toBe(`Usage: bridge [options] [command]

Options:
  -h, --help      display help for command

Commands:
  ping            Sends a MQTT ping
  help [command]  display help for command
`);
        });

        it("should display send pong on ping command", async () => {
            sendTextMessage("bridge ping");
            await wait(100);
            expect(publishValueMock).toBeCalledTimes(1);
            const [topic, message] = publishValueMock.mock.calls[0];
            expect(topic).toBe("mtx/rooms/room01/to");
            expect(message).toBe("pong!");
        });
    });

    describe("Text messages test", () => {
        it("should distribute room message to mqtt", () => {
            generateMatrixEvent(
                "m.room.message",
                "m.text",
                "Hello World!",
                "#room01:matrix",
                "someoneelse",
                Date.now() + 1000 //give it 1s time to execute
            );
            expect(publishValueMock).toBeCalledTimes(1);
            const [topic, message] = publishValueMock.mock.calls[0];
            expect(topic).toBe("mtx/rooms/room01/from");
            expect(message).toBe("Hello World!");
        });

        it("should sort out non message event", () => {
            generateMatrixEvent(
                "m.room.other",
                "m.text",
                "Hello World!",
                "#room01:matrix",
                "someoneelse",
                Date.now() + 1000 //give it 1s time to execute
            );
            expect(publishValueMock).not.toBeCalled();
        });

        it("should sort out non text message event", () => {
            generateMatrixEvent(
                "m.room.message",
                "m.bla",
                "Hello World!",
                "#room01:matrix",
                "someoneelse",
                Date.now() + 1000 //give it 1s time to execute
            );
            expect(publishValueMock).not.toBeCalled();
        });

        it("should sort out to old message event, when configured", async () => {
            generateMatrixEvent(
                "m.room.message",
                "m.text",
                "Hello World!",
                "#room01:matrix",
                "someoneelse",
                Date.now() - 10000
            );
            expect(publishValueMock).toBeCalledTimes(1);

            jest.clearAllMocks();
            const config = generateStdConfig();
            config.bridge.matrixMaxMessageAgeS = 1;
            await createBridge(config);
            generateMatrixEvent(
                "m.room.message",
                "m.text",
                "Hello World!",
                "#room01:matrix",
                "someoneelse",
                Date.now() - 10000
            );
            expect(publishValueMock).not.toBeCalled();
        });

        it("should sort out events from own user", () => {
            generateMatrixEvent(
                "m.room.message",
                "m.text",
                "Hello World!",
                "#room01:matrix",
                "@user01:localhost",
                Date.now() + 1000 //give it 1s time to execute
            );
            expect(publishValueMock).not.toBeCalled();
        });

        it("should sort out events from not known room", () => {
            generateMatrixEvent(
                "m.room.message",
                "m.text",
                "Hello World!",
                "#room99:matrix",
                "someoneelse",
                Date.now() + 1000 //give it 1s time to execute
            );
            expect(publishValueMock).not.toBeCalled();
        });
    });
});

describe("Incoming mqtt message tests", () => {
    let c: MatrixMqttBridge;
    let generateMqttMessage: any;
    beforeEach(async () => {
        const config = createBridgeConfig();
        config.bridge.rooms = [{ roomId: "room01" }];
        config.bridge.mqttTopicPrefix = "mtx";
        c = new MatrixMqttBridge(config);
        await wait(100);
        generateMqttMessage = (topic: string, message: string) => {
            (c as any)._mqttClient.onMessageCallback(
                topic,
                Buffer.from(message, "utf-8"),
                { qos: 0, retain: false }
            );
        };
    });

    it("should send mqtt message to room", () => {
        generateMqttMessage("mtx/rooms/room01/to", "Hello World!");
        expect(matrixClientMock.sendTextMessage).toBeCalledTimes(1);
        const [roomId, content] =
            matrixClientMock.sendTextMessage.mock.calls[0];
        expect(roomId).toBe("#room01:matrix");
        expect(content).toBe("Hello World!");
    });

    it("should not send mqtt message to unknown room", () => {
        generateMqttMessage("mtx/rooms/unknonwroom/to", "Hello World!");
        expect(matrixClientMock.sendTextMessage).not.toBeCalled();
    });
});
