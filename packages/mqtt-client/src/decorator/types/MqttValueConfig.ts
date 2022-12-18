// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { TypeName } from "@woifes/binarytypes";
import { Runtype } from "runtypes";
import { tMqttMsgHandlerConfig } from "./MqttMsgHandlerConfig";

export type tMqttValueConfig = tMqttMsgHandlerConfig & {
    type?: TypeName | "STRING" | "JSON";
    fallBackValue?: any;
    runtype?: Runtype;
};
