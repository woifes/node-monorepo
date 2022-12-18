// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { QoS } from "mqtt";
import { Client } from "../Client";
import {
    MqttClient,
    MqttMsgHandler,
    tMqttMsgHandlerConfig,
} from "../decorator";
import { Message } from "../Message";
import { TopicMap } from "./TopicMap";

export type tMqttStructConfig = {
    topic: string;
    valueKey?: string;
    qos?: QoS;
    valueTransform?: (content: string) => any;
};

/**
 * This object gathers all messages of a certain topic and generates a nested object structure out of it.
 * @param config.topic the topic to subscribe to
 * @param config.valueKey the object key the value itself should be stored with. default '' (empty string)
 * @param config.qos the qos to subscribe to the given topic
 * @param config.valueTransform a function which is called on every value in the topic structure
 */
@MqttClient()
export class MqttStruct {
    static mqttMsgConfig(this: MqttStruct): tMqttMsgHandlerConfig {
        return {
            topic: this._topic,
            qos: this._qos,
        };
    }

    private _topicMap: TopicMap<Message> = new TopicMap(false, true);
    private _topic: string;
    private _qos: QoS;
    private _valueKey: string;
    private _valueTransform: (content: string) => any;

    constructor(config: tMqttStructConfig, _client: Client) {
        this._topic = config.topic;
        this._valueKey = config.valueKey ?? "";
        this._qos = config.qos ?? 0;
        this._valueTransform =
            config.valueTransform ?? ((content: string) => content);
    }

    @MqttMsgHandler(MqttStruct.mqttMsgConfig)
    onMessage(msg: Message) {
        this._topicMap.setValue(msg.topic, msg);
    }

    toJSON() {
        return this._topicMap.generateObject(
            this._valueKey,
            (value: Message) => {
                return this._valueTransform(value.body);
            }
        );
    }
}
