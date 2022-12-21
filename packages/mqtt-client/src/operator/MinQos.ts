// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { QoS } from "mqtt";
import { Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { Message } from "../Message";

/**
 * Generates an rxjs operator which filters by a minimal QoS which
 * @param minQos
 * @returns
 */
export function MinQos(
    minQos: QoS
): (source: Observable<Message>) => Observable<Message> {
    return filter((value: Message) => {
        return value.qos >= minQos;
    });
}
