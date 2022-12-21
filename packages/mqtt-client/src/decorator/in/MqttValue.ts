// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tJsVal } from "@woifes/binarytypes";
import { Observable } from "rxjs";
import { Message } from "../../Message";
import { VALUE_LIST_KEY } from "../constants";
import { tMqttValueConfig } from "../types/MqttValueConfig";

/**
 * Registers the given property, setter or method as mqtt value.
 * The MqttClient decorator will subscribe a handler to the topic, which calls the method or updates the property or setter when a message is received.
 * @param config - either a config object directly or a function which can be called with the class in which the decorator is used as "this" property to create the config
 * @param config.topic the topic to subscribe to
 * @param config.qos qos for the subscription - default: 0
 * @param config.minQos minQos which is required for the message (will not be called if to low)
 * @param config.throttleMS min delay between messages - dropped otherwise
 * @param config.type the type the value in the message should have - dropped otherwise - default: "STRING"
 * @param config.fallBackValue optional - if the type check fails, use this value
 * @param config.runtype optional - used to check if the type is 'JSON'
 */
export function MqttValue(config: tMqttValueConfig | (() => tMqttValueConfig)) {
    return function (
        target: any,
        propertyKey: string,
        descriptor?: PropertyDescriptor
    ) {
        if (target[VALUE_LIST_KEY] == undefined) {
            target[VALUE_LIST_KEY] = new Map<
                (msg: Message) => void,
                (
                    config: any
                ) => (source: Observable<Message>) => Observable<any>
            >();
        }

        let mqttValueConfig: () => tMqttValueConfig;
        if (typeof config == "function") {
            mqttValueConfig = config;
        } else {
            mqttValueConfig = () => config;
        }

        let fn: (this: any, value: tJsVal) => void;

        if (descriptor == undefined || descriptor.set != undefined) {
            //Property or Setter
            fn = function (this: any, value: tJsVal) {
                this[propertyKey] = value;
            };
        } else if (descriptor.value != undefined) {
            //Method
            fn = function (this: any, value: tJsVal) {
                this[propertyKey](value);
            };
        } else {
            throw new Error(
                `MqttValue decorator set on something which is neither a property, setter or method`
            );
        }

        target[VALUE_LIST_KEY].set(fn, mqttValueConfig);
    };
}
