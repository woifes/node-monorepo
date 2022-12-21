// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Subscription } from "rxjs";
import {
    SUBSCRIPTION_LIST_KEY,
    UNSUBSCRIBE_CONNECTION_HANDLER_LIST_KEY,
    UNSUBSCRIBE_HOOK_NAME,
} from "../constants";

export function overrideUnsubscribeHook(this: any) {
    if (this[UNSUBSCRIBE_HOOK_NAME] != undefined) {
        const usm = this[this[UNSUBSCRIBE_HOOK_NAME]];
        if (usm != undefined && typeof usm == "function") {
            this[this[UNSUBSCRIBE_HOOK_NAME]] = function (...args: any[]) {
                for (let i = 0; i < this[SUBSCRIPTION_LIST_KEY].length; i++) {
                    this[SUBSCRIPTION_LIST_KEY][i].unsubscribe(); //call the unsubsribe function
                }
                for (
                    let i = 0;
                    i < this[UNSUBSCRIBE_CONNECTION_HANDLER_LIST_KEY].length;
                    i++
                ) {
                    (
                        this[
                            UNSUBSCRIBE_CONNECTION_HANDLER_LIST_KEY
                        ] as Subscription[]
                    )[i].unsubscribe(); //call the unsubscribe function
                }

                usm.apply(this, args); //call the original method implementation
            };
        } else {
            throw new Error(
                `MqttClient: given unsubscribe method could not be found: ${this[UNSUBSCRIBE_HOOK_NAME]}`
            );
        }
    }
}
