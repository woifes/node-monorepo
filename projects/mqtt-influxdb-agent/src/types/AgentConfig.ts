// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { ClientConfig } from "@woifes/mqtt-client";
import * as rt from "runtypes";
import { ItemConfig } from "../item/ItemConfig";

export const AgentConfig = rt.Record({
    mqtt: ClientConfig,
    influx: rt.Record({
        url: rt.String,
        token: rt.String,
        organization: rt.String,
        flushIntervalMS: rt.Number.withConstraint((n) => n > 0),
    }),
    items: rt.Array(ItemConfig),
});

export type tAgentConfig = rt.Static<typeof AgentConfig>;
