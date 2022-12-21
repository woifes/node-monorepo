// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { S7Server } from "node-snap7";

export class TestServer {
    private _server: S7Server;

    constructor(ip = "localhost") {
        this._server = new S7Server();
        this._server.StartTo(ip);
    }

    setArea(dbNr: number, area: Buffer) {
        const oldArea = this.getDbArea(dbNr);
        this._server.LockArea(5, dbNr);
        if (oldArea.length != 0 && oldArea.length === area.length) {
            this._server.SetArea(5, dbNr, area);
        } else if (oldArea.length == 0) {
            this._server.RegisterArea(5, dbNr, area);
        } else {
            this._server.UnregisterArea(5, dbNr);
            this._server.RegisterArea(5, dbNr, area);
        }
        this._server.UnlockArea(5, dbNr);
    }

    getDbArea(dbNr: number): Buffer {
        let area;
        try {
            this._server.LockArea(5, dbNr);
            area = this._server.GetArea(5, dbNr);
        } catch (e) {
            area = Buffer.alloc(0);
        } finally {
            this._server.UnlockArea(5, dbNr);
        }
        return area;
    }

    start() {
        this._server.Start();
    }

    stop() {
        this._server.Stop();
    }
}
