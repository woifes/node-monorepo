// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ClientConfig } from "../src/ClientConfig";

//TODO caCertificate (is optional)

it("should validate correct runtype", () => {
    expect(() => {
        ClientConfig.check({
            url: "localhost",
            clientId: "client01",
        });
    }).not.toThrow();

    expect(() => {
        ClientConfig.check({
            url: "localhost",
            clientId: "client01",
            notifyPresencePrefix: "clients",
            messageCacheTimeS: 10,
            auth: {
                username: "user1",
                password: "123456",
            },
        });
    }).not.toThrow();

    expect(() => {
        ClientConfig.check({
            url: "localhost",
            clientId: "client01",
            notifyPresencePrefix: "clients",
            messageCacheTimeS: 10,
            caCertificate: "cert",
        });
    }).not.toThrow();
});

it("should not allow empty url", () => {
    expect(() => {
        ClientConfig.check({
            url: "",
            clientId: "client01",
            notifyPresencePrefix: "clients",
            messageCacheTimeS: 10,
            auth: "path/to/auth",
            caCertificate: "cert",
        });
    }).toThrow();
});

it("should not allow empty clientId", () => {
    expect(() => {
        ClientConfig.check({
            url: "localhost",
            clientId: "",
            notifyPresencePrefix: "clients",
            messageCacheTimeS: 10,
            auth: "path/to/auth",
            caCertificate: "cert",
        });
    }).toThrow();
});

it("should not allow empty notifyPresencePrefix", () => {
    expect(() => {
        ClientConfig.check({
            url: "localhost",
            clientId: "client01",
            notifyPresencePrefix: "",
            messageCacheTimeS: 10,
            auth: "path/to/auth",
            caCertificate: "cert",
        });
    }).toThrow();
});

it("should not allow negative messageCacheTimeS", () => {
    expect(() => {
        ClientConfig.check({
            url: "localhost",
            clientId: "client01",
            notifyPresencePrefix: "clients",
            messageCacheTimeS: -1,
            auth: "path/to/auth",
            caCertificate: "cert",
        });
    }).toThrow();
});

it("should not allow empty caCertificate", () => {
    expect(() => {
        ClientConfig.check({
            url: "localhost",
            clientId: "client01",
            notifyPresencePrefix: "clients",
            messageCacheTimeS: 10,
            auth: "path/to/auth",
            caCertificate: "",
        });
    }).toThrow();
});
