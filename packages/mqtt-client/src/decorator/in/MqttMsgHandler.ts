// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Message } from "../../Message";
import { MSG_HANDLER_LIST_KEY } from "../constants";
import { tMqttMsgHandlerConfig } from "../types/MqttMsgHandlerConfig";

/**
 * Marks the given method or setter as message handler.
 * The MqttClient decorator on the class will register the given setter or method to the mqtt client
 * @param config - either a config object directly or a function which can be called with the class in which the decorator is used as "this" property to create the config
 * @param config.topic the topic to subscribe to
 * @param config.qos qos for the subscription - default: 0
 * @param config.minQos minQos which is required for the message (will not be called if to low)
 * @param config.throttleMS min delay between messages - dropped otherwise
 */
export function MqttMsgHandler(
    config: tMqttMsgHandlerConfig | (() => tMqttMsgHandlerConfig)
): MethodDecorator {
    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        if (typeof propertyKey == "string") {
            if (target[MSG_HANDLER_LIST_KEY] == undefined) {
                target[MSG_HANDLER_LIST_KEY] = new Map<
                    (msg: Message) => void,
                    () => tMqttMsgHandlerConfig
                >();
            }
            let msgHandlerConfig: () => tMqttMsgHandlerConfig;
            if (typeof config == "function") {
                msgHandlerConfig = config;
            } else {
                msgHandlerConfig = () => config;
            }

            let fn: (msg: Message) => void;

            if (descriptor != undefined && descriptor.set != undefined) {
                //Setter
                fn = function (this: any, msg: Message) {
                    this[propertyKey] = msg;
                };
            } else if (descriptor.value != undefined) {
                //Method
                fn = function (this: any, msg: Message) {
                    this[propertyKey](msg);
                };
            } else {
                throw new Error(
                    `MqttMsgHandler decorator set on something which is neither a property, setter or method`
                );
            }
            target[MSG_HANDLER_LIST_KEY].set(fn, msgHandlerConfig);
        } else {
            throw new Error(`MqttMsgHandler can not be set on Symbol property`);
        }
    };
}
