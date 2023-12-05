// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { ClientConfig } from "@woifes/mqtt-client";
import * as rt from "runtypes";
import { rtItemConfig } from "../item/ItemConfig";

export const rtMqttPostgresAgentConfig = rt.Record({
    mqtt: ClientConfig,
    postgres: rt
        .Record({
            user: rt.String.optional(), // default process.env.PGUSER || process.env.USER
            password: rt.String.optional(), //default process.env.PGPASSWORD
            host: rt.String.optional(), // default process.env.PGHOST
            database: rt.String.optional(), // default process.env.PGDATABASE || user
            port: rt.Number.optional(), // default process.env.PGPORT
            connectionString: rt.String.optional(), // e.g. postgres://user:password@host:5432/database
            ssl: rt.Unknown.optional(), // passed directly to node.TLSSocket, supports all tls.connect options
            types: rt.Unknown.optional(), // custom type parsers
            statement_timeout: rt.Number.optional(), // number of milliseconds before a statement in query will time out, default is no timeout
            query_timeout: rt.Number.optional(), // number of milliseconds before a query call will timeout, default is no timeout
            application_name: rt.String.optional(), // The name of the application that created this Client instance
            connectionTimeoutMillis: rt.Number.optional(), // number of milliseconds to wait for connection, default is no timeout
            idle_in_transaction_session_timeout: rt.Number.optional(), // number of milliseconds before terminating any session with an open idle transaction, default is no timeout

            // number of milliseconds a client must sit idle in the pool and not be checked out
            // before it is disconnected from the backend and discarded
            // default is 10000 (10 seconds) - set to 0 to disable auto-disconnection of idle clients
            idleTimeoutMillis: rt.Number.optional(),

            // maximum number of clients the pool should contain
            // by default this is set to 10.
            max: rt.Number.optional(),

            // Default behavior is the pool will keep clients open & connected to the backend
            // until idleTimeoutMillis expire for each client and node will maintain a ref
            // to the socket on the client, keeping the event loop alive until all clients are closed
            // after being idle or the pool is manually shutdown with `pool.end()`.
            //
            // Setting `allowExitOnIdle: true` in the config will allow the node event loop to exit
            // as soon as all clients in the pool are idle, even if their socket is still open
            // to the postgres server.  This can be handy in scripts & tests
            // where you don't want to wait for your clients to go idle before your process exits.
            allowExitOnIdle: rt.Boolean.optional(),
        })
        .optional(),
    items: rt.Array(rtItemConfig),
});

export type MqttPostgresAgentConfig = rt.Static<
    typeof rtMqttPostgresAgentConfig
>;
