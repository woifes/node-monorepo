// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { QoS } from "mqtt-packet";

export type tMqttMsgHandlerConfig = {
    topic: string;
    qos?: QoS;
    minQos?: QoS;
    throttleMS?: number;
};
