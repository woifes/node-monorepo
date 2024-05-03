// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tJsVal } from "@woifes/binarytypes";
import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { Message } from "../../Message";
import { tMqttValueConfig } from "../types/MqttValueConfig";
import { MsgOperatorFactory } from "./MsgOperatorFactory";

export type tValueOperator = (
    source: Observable<Message>,
) => Observable<tJsVal>;

export function ValueOperatorFactory(
    config: tMqttValueConfig,
): (source: Observable<Message>) => Observable<tJsVal> {
    return (source: Observable<Message>) => {
        source = source.pipe(MsgOperatorFactory(config));
        const anyTarget = source.pipe(
            map((value: Message) => {
                let res: tJsVal | null = null;
                const type = config.type ?? "STRING";
                try {
                    if (type === "JSON") {
                        res = value.readJSON(
                            config.runtype,
                            config.fallBackValue,
                        );
                    } else if (type === "STRING") {
                        res = value.body;
                    } else {
                        res = value.readValue(type, config.fallBackValue);
                    }
                    return res;
                } catch {}
            }),
            filter((value: any) => {
                return value != null;
            }),
        );
        return anyTarget;
    };
}
