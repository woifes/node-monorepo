// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tJsVal } from "@woifes/binarytypes";
import { Client } from "../../Client";
import { SUBSCRIPTION_LIST_KEY, VALUE_LIST_KEY } from "../constants";
import { tMqttValueConfig } from "../types/MqttValueConfig";
import { ValueOperatorFactory } from "../util/ValueOperatorFactory";

export function subscribeValue(this: any, client: Client) {
    //subscribe to the topics on the client object
    if (this[SUBSCRIPTION_LIST_KEY] === undefined) {
        this[SUBSCRIPTION_LIST_KEY] = [];
    }

    if (this[VALUE_LIST_KEY] === undefined || this[VALUE_LIST_KEY].size === 0) {
        return;
    }
    const list = this[VALUE_LIST_KEY] as Map<
        (msg: tJsVal) => void,
        () => tMqttValueConfig
    >;
    const unsubList = this[SUBSCRIPTION_LIST_KEY];
    for (let [fn, configFactory] of list) {
        const config = configFactory.call(this);
        if (config.topic.length > 0) {
            const obsr = client.mqttSubscribe(config.topic, config.qos ?? 0);
            const valObsrv = obsr.pipe(ValueOperatorFactory(config));
            fn = fn.bind(this);
            unsubList.push(valObsrv.subscribe(fn));
        }
    }
}
