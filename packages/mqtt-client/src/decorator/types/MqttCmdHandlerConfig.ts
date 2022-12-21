// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { tMqttMsgHandlerConfig } from "./MqttMsgHandlerConfig";

export type tMqttCmdHandlerConfig = tMqttMsgHandlerConfig & {
    topicTransform?: (request: string[]) => string[];
};
