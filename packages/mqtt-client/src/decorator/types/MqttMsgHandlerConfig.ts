// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { QoS } from "mqtt";

export type tMqttMsgHandlerConfig = {
    topic: string;
    qos?: QoS;
    minQos?: QoS;
    throttleMS?: number;
};
