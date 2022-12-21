// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client } from "../../Client";
import { Message } from "../../Message";
import { MSG_HANDLER_LIST_KEY, SUBSCRIPTION_LIST_KEY } from "../constants";
import { tMqttMsgHandlerConfig } from "../types/MqttMsgHandlerConfig";
import { MsgOperatorFactory } from "../util/MsgOperatorFactory";

export function subscribeMsgHandler(this: any, client: Client) {
    //subscribe to the topics on the client object
    if (this[SUBSCRIPTION_LIST_KEY] == undefined) {
        this[SUBSCRIPTION_LIST_KEY] = [];
    }

    if (
        this[MSG_HANDLER_LIST_KEY] == undefined ||
        this[MSG_HANDLER_LIST_KEY].size == 0
    ) {
        return;
    } else {
        const list = this[MSG_HANDLER_LIST_KEY] as Map<
            (msg: Message) => void,
            () => tMqttMsgHandlerConfig
        >;
        const unsubList = this[SUBSCRIPTION_LIST_KEY];
        for (let [fn, configFactory] of list) {
            const config = configFactory.call(this);
            if (config.topic.length > 0) {
                let obsr = client.mqttSubscribe(config.topic, config.qos ?? 0);
                obsr = obsr.pipe(MsgOperatorFactory(config));
                fn = fn.bind(this);
                unsubList.push(obsr.subscribe(fn));
            }
        }
    }
}
