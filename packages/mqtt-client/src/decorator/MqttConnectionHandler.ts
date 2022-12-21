// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { CONNECTION_HANDLER_LIST_KEY } from "./constants";

/**
 * Decorator for a method which should be called when the connection state of the client changes.
 * Receives a single boolean indication if the client is now ONLINE
 */
export function MqttConnectionHandler() {
    return function (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        if (typeof propertyKey == "string") {
            if (target[CONNECTION_HANDLER_LIST_KEY] == undefined) {
                target[CONNECTION_HANDLER_LIST_KEY] = [];
            }

            let fn: (this: any, isOnline: boolean) => void;

            if (descriptor.value != undefined) {
                //Method
                fn = function (this: any, isOnline: boolean) {
                    this[propertyKey](isOnline);
                };
            } else {
                throw new Error(
                    `MqttConnectHandler set on something wich is not a method`
                );
            }
            target[CONNECTION_HANDLER_LIST_KEY].push(fn);
        } else {
            throw new Error(
                `MqttConnectHandler can not be set on Symbol property`
            );
        }
    };
}
