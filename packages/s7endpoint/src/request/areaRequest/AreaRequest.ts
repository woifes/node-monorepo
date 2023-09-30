// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Array as rtArray } from "runtypes";
import { S7Endpoint } from "../../S7Endpoint";
import { tS7DataAreas } from "../../const";
import { S7Variable, tS7Variable } from "../../types/S7Variable";
import { sortS7Addresses } from "../../util/sortDb";
import { getBoundsOfVarSet } from "../util/getBoundsOfVarSet";

export class AreaRequest {
    protected _dbNr?: number;
    protected _area: tS7DataAreas;
    protected _variablesUnsorted: tS7Variable[];
    protected _variables: tS7Variable[];
    protected _startIndex: number;
    protected _length: number;
    protected _endpoint: S7Endpoint;

    constructor(variables: tS7Variable[], endpoint: S7Endpoint) {
        this._dbNr = variables[0].dbNr;
        this._area = variables[0].area;
        this._variablesUnsorted = variables;
        this._variables = [...rtArray(S7Variable).check(variables)].sort(
            sortS7Addresses,
        );

        const [start, end] = getBoundsOfVarSet(this._variables);
        this._startIndex = start;
        this._length = end - start;
        this._endpoint = endpoint;
    }

    get length(): number {
        return this._length;
    }
}
