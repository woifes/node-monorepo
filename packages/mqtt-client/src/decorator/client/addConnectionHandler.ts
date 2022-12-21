// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Subscription } from "rxjs";
import { Client } from "../../Client";
import {
    CONNECTION_HANDLER_LIST_KEY,
    UNSUBSCRIBE_CONNECTION_HANDLER_LIST_KEY,
} from "../constants";

export function addConnectionHandler(this: any, client: Client) {
    if (this[UNSUBSCRIBE_CONNECTION_HANDLER_LIST_KEY] == undefined) {
        this[UNSUBSCRIBE_CONNECTION_HANDLER_LIST_KEY] = [];
    }

    if (this[CONNECTION_HANDLER_LIST_KEY] != undefined) {
        const list: ((isOnline: boolean) => void)[] =
            this[CONNECTION_HANDLER_LIST_KEY];
        const unsubList = this[
            UNSUBSCRIBE_CONNECTION_HANDLER_LIST_KEY
        ] as Subscription[];
        for (let i = 0; i < list.length; i++) {
            const sub = client.connectionState().subscribe(list[i].bind(this));
            unsubList.push(sub);
        }
    }
}
