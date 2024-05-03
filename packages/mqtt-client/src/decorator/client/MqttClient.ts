// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Client } from "../../Client";
import { CONNECTION_TO_USE_INFO } from "../constants";
import { addConnectionHandler } from "./addConnectionHandler";
import { overrideUnsubscribeHook } from "./overrideUnsubscribeHook";
import { subscribeCmdHandler } from "./subscribeCmdHandler";
import { subscribeMsgHandler } from "./subscribeMsgHandler";
import { subscribeValue } from "./subscribeValue";

export type tConnectionToUseInfo = string | number;

/**
 * Marks the decorated class to use an mqtt client to subscribe decorated properties, setters and methods
 * The client object to use is searched in the following order:
 * 1. (AT)MqttConnection decorated constructor parameter
 * 2. (AT)MqttConnection decorated property
 * 3. The first Client in arguments list of the constructor
 * 4. The first property which is a Client object
 * @returns
 */
export function MqttClient() {
    //biome-ignore lint/complexity/noBannedTypes: needed
    return <T extends { new (...args: any[]): {} }>(originalConstructor: T) => {
        const info: tConnectionToUseInfo = (originalConstructor as any)[
            CONNECTION_TO_USE_INFO
        ];
        return class extends originalConstructor {
            constructor(...args: any[]) {
                super(...args);

                let client: Client | undefined = undefined;
                const self = this as any;

                //find the mqtt client object to use
                if (info !== undefined) {
                    client = args[info as number];
                } else if (self[CONNECTION_TO_USE_INFO] !== undefined) {
                    client = self[self[CONNECTION_TO_USE_INFO]];
                } else {
                    for (let i = 0; i < args.length; i++) {
                        if (args[i] instanceof Client) {
                            client = args[i];
                            break;
                        }
                    }
                    if (client === undefined) {
                        //go on
                        for (const key in this) {
                            if (
                                Object.prototype.hasOwnProperty.call(this, key)
                            ) {
                                const property = this[key];
                                if (property instanceof Client) {
                                    client = property;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (client === undefined || !(client instanceof Client)) {
                    throw new Error(
                        "MqttClient decorator did not find mqtt client to use",
                    );
                }

                subscribeMsgHandler.call(self, client);
                subscribeCmdHandler.call(self, client);
                subscribeValue.call(self, client);
                //
                addConnectionHandler.call(self, client);

                //set unsubscribe method
                overrideUnsubscribeHook.call(self);
            }
        };
    };
}
