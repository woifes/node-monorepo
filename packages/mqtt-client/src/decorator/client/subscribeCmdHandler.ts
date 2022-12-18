// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { Client } from "../../Client";
import { Message } from "../../Message";
import { CMD_HANDLER_LIST_KEY, SUBSCRIPTION_LIST_KEY } from "../constants";
import { tMqttCmdHandlerConfig } from "../types/MqttCmdHandlerConfig";
import { MsgOperatorFactory } from "../util/MsgOperatorFactory";

export function subscribeCmdHandler(this: any, client: Client) {
    //subscribe to the topics on the client object
    if (this[SUBSCRIPTION_LIST_KEY] == undefined) {
        this[SUBSCRIPTION_LIST_KEY] = [];
    }

    if (
        this[CMD_HANDLER_LIST_KEY] == undefined ||
        this[CMD_HANDLER_LIST_KEY].size == 0
    ) {
        return;
    } else {
        const list = this[CMD_HANDLER_LIST_KEY] as Map<
            (msg: Message, res: Message) => void,
            () => tMqttCmdHandlerConfig
        >;
        const unsubList = this[SUBSCRIPTION_LIST_KEY];
        for (let [fn, configFactory] of list) {
            const config = configFactory.call(this);
            if (config.topic.length > 0) {
                fn = fn.bind(this);
                let obsr = client.mqttSubscribe(config.topic, config.qos ?? 0);
                obsr = obsr.pipe(MsgOperatorFactory(config));
                const topicTransform =
                    config.topicTransform ??
                    ((topic: string[]) => {
                        topic = [...topic];
                        if (topic.length === 4 && topic[0] == "cmd") {
                            topic[0] = "cmdRes";
                            const sender = topic[2];
                            topic[2] = topic[1];
                            topic[1] = sender;
                        }
                        return topic;
                    });
                unsubList.push(
                    obsr.subscribe((msg: Message) => {
                        const resTopic = topicTransform(msg.topic).join("/");
                        if (resTopic.length > 0) {
                            const res = new Message(
                                topicTransform(msg.topic).join("/"),
                                msg.qos,
                                msg.retain,
                                undefined,
                                msg.client
                            );
                            fn(msg, res);
                        }
                    })
                );
            }
        }
    }
}
