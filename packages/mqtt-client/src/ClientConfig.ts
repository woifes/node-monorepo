// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as rt from "runtypes";

export const ClientConfig = rt.Record({
    url: rt.String.withConstraint((s) => s.length > 0 || "url has length 0"),
    clientId: rt.String.withConstraint(
        (s) => s.length > 0 || "clientId has length 0",
    ),
    notifyPresencePrefix: rt.String.withConstraint((s) => {
        return s.length > 0 || "NotifyPresencePrefix must not be empty string";
    }).optional(),
    messageCacheTimeS: rt.Number.withConstraint(
        (n) => n >= 0 || "messageCache is negative",
    ).optional(),
    auth: rt
        .Record({
            username: rt.String,
            password: rt.String,
        })
        .optional(),
    caCertificate: rt.String.withConstraint((s) => s.length > 0).optional(),
});

export type tClientConfig = rt.Static<typeof ClientConfig>;
