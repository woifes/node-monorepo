// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { S7Endpoint } from "../S7Endpoint";
import { tS7Variable } from "../types/S7Variable";
import { Request } from "./Request";
import { AreaReadRequest } from "./areaRequest/AreaReadRequest";

/**
 * Represents a read request on the given endpoint. The tags can be from different data blocks.
 * The names of the variables have to be unique
 */
export class ReadRequest extends Request {
    private _areaRequests: Map<string, AreaReadRequest> = new Map();

    constructor(variables: tS7Variable[], endpoint: S7Endpoint) {
        super(variables, endpoint);

        for (const [area, variableSet] of this._varsByArea.entries()) {
            this._areaRequests.set(
                area,
                new AreaReadRequest(variableSet, this._endpoint),
            );
        }
    }

    /**
     * Reads the given tags from the corresponding data blocks of the underlying endpoint
     * @returns object where the keys are the given tag names and the values the tag object with set value property
     */
    async execute(): Promise<tS7Variable[]> {
        const promises: Map<string, Promise<tS7Variable[]>> = new Map();

        //start every promise so it can start to perform the request
        for (const [area, areaRequest] of this._areaRequests.entries()) {
            promises.set(area, areaRequest.execute());
        }

        const result: tS7Variable[] = [];
        //await every promise (if a promise is already done await will finish immediately)
        for (const [area, areaPromise] of promises.entries()) {
            const areaResult = await areaPromise;
            const areaVariableIndexes = this._indexesByArea.get(area)!;
            for (let i = 0; i < areaVariableIndexes.length; i++) {
                const variable = areaResult[i];
                const index = areaVariableIndexes[i];
                result[index] = variable;
            }
        }

        return result;
    }
}
