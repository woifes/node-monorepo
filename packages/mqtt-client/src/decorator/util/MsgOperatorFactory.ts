// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Observable } from "rxjs";
import { throttleTime } from "rxjs/operators";
import { Message } from "../../Message";
import { MinQos } from "../../operator/MinQos";
import { tMqttMsgHandlerConfig } from "../types/MqttMsgHandlerConfig";

export type tMsgOperator = (source: Observable<Message>) => Observable<Message>;

export function MsgOperatorFactory(config: tMqttMsgHandlerConfig) {
    return (obsrv: Observable<Message>): Observable<Message> => {
        if (config.throttleMS !== undefined) {
            obsrv = obsrv.pipe(throttleTime(config.throttleMS));
        }

        if (config.minQos !== undefined) {
            obsrv = obsrv.pipe(MinQos(config.minQos));
        }

        return obsrv;
    };
}
