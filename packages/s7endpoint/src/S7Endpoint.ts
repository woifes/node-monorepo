// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { tS7DataAreas } from "./const";
import { ReadRequest, WriteRequest } from "./request";
import { tS7Variable } from "./types/S7Variable";

export interface S7Endpoint {
    on(event: "connect", listener: () => void): this;
    on(event: "disconnect", listener: () => void): this;
    once(event: "connect", listener: () => void): this;
    once(event: "disconnect", listener: () => void): this;

    name: string;
    connected: boolean;
    connect(): void;
    disconnect(): void;
    stop(): void;
    createReadRequest(tags: tS7Variable[]): ReadRequest;
    createWriteRequest(tags: tS7Variable[]): WriteRequest;
    readAreaBytes(
        area: tS7DataAreas,
        dbNr: number,
        dbIndex: number,
        length: number,
    ): Promise<Buffer>;
    writeAreaBytes(
        area: tS7DataAreas,
        dbNr: number,
        dbIndex: number,
        buf: Buffer,
    ): Promise<void>;
}
