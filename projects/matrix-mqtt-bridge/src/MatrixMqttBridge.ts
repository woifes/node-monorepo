// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
    Client as MqttChannel,
    Message as MqttMessage,
} from "@woifes/mqtt-client";
import {
    MqttClient,
    MqttConnection,
    MqttConnectionHandler,
    MqttMsgHandler,
    tMqttMsgHandlerConfig,
} from "@woifes/mqtt-client/decorator";
import { debug } from "debug";
import {
    createClient as matrixCreateClient,
    MatrixClient,
    MatrixEvent,
    Visibility as MatrixVisibility,
} from "matrix-js-sdk";
import {
    MatrixMqttBridgeConfig,
    tMatrixMqttBridgeConfig,
} from "./MatrixMqttBridgeConfig";

@MqttClient()
export class MatrixMqttBridge {
    static mqttMsgConfig(this: MatrixMqttBridge): tMqttMsgHandlerConfig {
        return {
            topic: `${this._mqttTopicPrefix}/rooms/+/to`,
        };
    }
    @MqttConnection() private _mqttClient: MqttChannel;
    private _matrixClient: MatrixClient;
    private _config: tMatrixMqttBridgeConfig;
    private _debug = debug("MatrixMqttBridge");

    private _roomIds: Map<string, string> = new Map();
    private _userId: string;
    private _mqttTopicPrefix: string;

    /**
     *
     * @param config.mqtt the mqtt config
     * @param config.matrix.url the url of the homeserver (without the protcoll part)
     * @param config.matrix.username the username of the user to use
     * @param config.matrix.accessToken the accessToken from the given user
     * @param config.bridge.mqttTopicPrefix prefix for the mqtt topics - default: "matrix"
     * @param config.bridge.rooms an array of rooms (name and federate option)
     */
    constructor(config: tMatrixMqttBridgeConfig) {
        this._config = MatrixMqttBridgeConfig.check(config);
        this._userId = this.getMatrixUserId(this._config.matrix.userName);
        this._mqttTopicPrefix = this._config.bridge.mqttTopicPrefix ?? "matrix";
        this._matrixClient = matrixCreateClient({
            baseUrl: `https://${this._config.matrix.url}`,
            userId: this._userId,
            accessToken: this._config.matrix.accessToken,
        });
        this._mqttClient = new MqttChannel(this._config.mqtt);
        this.setup();
    }

    /**
     * Returns the matrix variant (#bridgeRoomId:url) from the bridge roomId
     * @param bridgeAlias the bridge roomId
     * @returns
     */
    private getMatrixRoomAlias(bridgeAlias: string) {
        return `#${bridgeAlias}:${this._config.matrix.url}`;
    }

    /**
     * Iterates over the matrix roomIds an tries to find the corresponding bridgeRoomId
     * @param matrixRoomId the matrix roomId to search for
     * @returns the bridge roomId or empty string if not found
     */
    private findBridgeAliasFromMatrixRoomId(matrixRoomId: string): string {
        for (const [brideRoomId, roomId] of this._roomIds.entries()) {
            if (roomId === matrixRoomId) {
                return brideRoomId;
            }
        }
        return "";
    }

    /**
     * Return the matrix userId (@username:url) from the username
     * @param userName the username
     * @returns
     */
    private getMatrixUserId(userName: string) {
        return `@${userName}:${this._config.matrix.url}`;
    }

    /**
     * Starts the matrix client and join the required rooms
     */
    private async setup() {
        await this._matrixClient.startClient();
        await this.matrixJoinRequiredRooms();
        this._matrixClient.on("Room.timeline" as any, (event: MatrixEvent) => {
            this.matrixOnRoomMessage(event);
        });
    }

    @MqttConnectionHandler()
    private onMqttConnect(connected: boolean) {
        if (connected) {
            this._mqttClient.publishValue(
                `${this._mqttTopicPrefix}/rooms`,
                this._config.bridge.rooms.map((r) => {
                    return r.roomId;
                }),
                "JSON"
            );
        }
    }

    /**
     * Tries to find the matrix roomId of the required rooms and joins the rooms. Creates the room if it is missing.
     */
    private async matrixJoinRequiredRooms() {
        for (const room of this._config.bridge.rooms) {
            let matrixRoomId: string;
            try {
                matrixRoomId = (
                    await this._matrixClient.getRoomIdForAlias(
                        this.getMatrixRoomAlias(room.roomId)
                    )
                ).room_id;
            } catch (e) {
                this._debug(`Could not find roomId for alias ${room.roomId}`);
                const visibilityPublic = room.public ?? true;
                matrixRoomId = (
                    await this._matrixClient.createRoom({
                        name: room.roomId,
                        room_alias_name: room.roomId,
                        visibility: visibilityPublic
                            ? MatrixVisibility.Public
                            : MatrixVisibility.Private,
                        creation_content: {
                            "m.federate": room.federate ?? true,
                        },
                    })
                ).room_id;
            }
            this._roomIds.set(room.roomId, matrixRoomId);
            this._debug(`Join room ${room.roomId}`);
            await this._matrixClient.joinRoom(matrixRoomId);
        }
    }

    /**
     * Sends a message to the room of the given bridge roomId
     * @param bridgeRoomId the bridge roomId
     * @param msg the message to send
     */
    private async matrixSendMsgToRoom(bridgeRoomId: string, msg: string) {
        const content = {
            body: msg,
            msgtype: "m.text",
        };
        const matrixRoomId = this._roomIds.get(bridgeRoomId);
        if (matrixRoomId !== undefined) {
            this._debug(`Send message to matrix: ${bridgeRoomId} ${msg}`);
            const res = await this._matrixClient.sendEvent(
                matrixRoomId,
                "m.room.message",
                content,
                ""
            );
        }
    }

    /**
     * Handler for a incoming matrix message
     * @param event MatrixEvent
     * @returns
     */
    private matrixOnRoomMessage(event: MatrixEvent) {
        if (event.getType() !== "m.room.message") {
            return; //only message events
        }
        if (event.getContent().msgtype !== "m.text") {
            return; //only text events
        }
        if (Date.now() - event.localTimestamp > 1000) {
            return; //only recent events
        }
        if (event.sender!.userId === this._userId) {
            return; //only events from someone else
        }
        const bridgeRoomId = this.findBridgeAliasFromMatrixRoomId(
            event.getRoomId()!
        );
        if (bridgeRoomId.length === 0) {
            return; //only known rooms
        }

        this.mqttSendRoomMessage(bridgeRoomId, event.getContent().body);
    }

    /**
     * Handler for incoming mqtt message
     * @param msg the message object
     */
    @MqttMsgHandler(MatrixMqttBridge.mqttMsgConfig)
    private mqttMsgHandler(msg: MqttMessage) {
        const [_, _2, bridgeRoomId] = msg.topic; //matrix/rooms/<bridgeRoomId>
        this.matrixSendMsgToRoom(bridgeRoomId, msg.body);
    }

    /**
     * Sends the message to the corresponding mqtt topic
     * @param bridgeRoomId the bridge roomId
     * @param content the content to send
     */
    private mqttSendRoomMessage(bridgeRoomId: string, content: string) {
        this._debug(`Send message to mqtt: ${bridgeRoomId}, ${content}`);
        this._mqttClient.publishValue(
            `${this._mqttTopicPrefix}/rooms/${bridgeRoomId}/from`,
            content
        );
    }
}
