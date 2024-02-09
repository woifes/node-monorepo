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
        const promises: Promise<tS7Variable[]>[] = []; //Map<string, Promise<tS7Variable[]>> = new Map();
        const areas: string[] = [];

        //start every promise so it can start to perform the request
        for (const [area, areaRequest] of this._areaRequests.entries()) {
            promises.push(areaRequest.execute());
            areas.push(area);
        }

        const promisesResult = await Promise.all(promises);

        const result: tS7Variable[] = [];
        for (let i = 0; i < promisesResult.length; i++) {
            const areaResult = promisesResult[i];
            const area = areas[i];
            const areaVariableIndexes = this._indexesByArea.get(area)!;
            for (let j = 0; j < areaVariableIndexes.length; j++) {
                const variable = areaResult[j];
                const index = areaVariableIndexes[j];
                result[index] = variable;
            }
        }

        return result;
    }
}
