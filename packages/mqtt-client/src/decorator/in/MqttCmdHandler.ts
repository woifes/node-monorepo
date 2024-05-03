// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Message } from "../../Message";
import { CMD_HANDLER_LIST_KEY } from "../constants";
import { tMqttCmdHandlerConfig } from "../types/MqttCmdHandlerConfig";

/**
 * Decorates a method to be called if a certain mqtt command is received.
 * The method will be called with two arguments: The received message and a constructed response message
 * @param config - either a config object directly or a function which can be called with the class in which the decorator is used as "this" property to create the config
 * @param config.topic the topic to subscribe to
 * @param config.qos qos for the subscription - default: 0
 * @param config.minQos minQos which is required for the message (will not be called if to low)
 * @param config.throttleMS min delay between messages - dropped otherwise
 * @param config.topicTransform Function which is called with the object as this reference and the topic of the command message as arguments
 * Should return a string array which is used for the topic of the response message.
 * If an empty array is returned the decorated method will not be called
 */
export function MqttCmdHandler(
    config: tMqttCmdHandlerConfig | (() => tMqttCmdHandlerConfig),
): MethodDecorator {
    return (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) => {
        if (typeof propertyKey === "string") {
            if (target[CMD_HANDLER_LIST_KEY] === undefined) {
                target[CMD_HANDLER_LIST_KEY] = new Map<
                    (msg: Message) => void,
                    () => tMqttCmdHandlerConfig
                >();
            }

            let msgHandlerConfig: () => tMqttCmdHandlerConfig;
            if (typeof config === "function") {
                msgHandlerConfig = config;
            } else {
                msgHandlerConfig = () => config;
            }

            let fn: (msg: Message, res: Message) => void;

            if (descriptor.value !== undefined) {
                //Method
                fn = function (this: any, msg: Message, res: Message) {
                    this[propertyKey](msg, res);
                };
            } else {
                throw new Error(
                    "MqttCmdHandler decorator set on something which is no method",
                );
            }
            target[CMD_HANDLER_LIST_KEY].set(fn, msgHandlerConfig);
        } else {
            throw new Error("MqttCmdHandler can not be set on Symbol property");
        }
    };
}
