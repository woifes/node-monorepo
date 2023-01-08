// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { S7Endpoint } from "../S7Endpoint";
import { tS7Variable } from "../types/S7Variable";
import { AreaWriteRequest } from "./areaRequest/AreaWriteRequest";
import { Request } from "./Request";

/**
 * Represents a write request on the given endpoint. The tags can be from different data blocks.
 * The names of the tags have to be unique
 */
export class WriteRequest extends Request {
    private _areaRequests: AreaWriteRequest[] = [];

    constructor(variables: tS7Variable[], endpoint: S7Endpoint) {
        super(variables, endpoint);

        for (const variableSet of this._varsByArea.values()) {
            this._areaRequests.push(
                new AreaWriteRequest(variableSet, this._endpoint)
            );
        }
    }

    /**
     * Executes the configured write operation
     * @returns Promise.all of the underlying requests
     */
    async execute() {
        const promises: Promise<unknown>[] = [];
        for (let i = 0; i < this._areaRequests.length; i++) {
            promises.push(this._areaRequests[i].execute());
        }
        return await Promise.all(promises);
    }
}
