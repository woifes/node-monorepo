// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Array as rtArray } from "runtypes";
import { S7Endpoint } from "../S7Endpoint";
import { S7Variable, tS7Variable } from "../types/S7Variable";

export class Request {
    protected _variables: tS7Variable[];
    protected _varsByArea: Map<string, tS7Variable[]> = new Map();
    protected _indexesByArea: Map<string, number[]> = new Map();
    protected _endpoint: S7Endpoint;

    constructor(variables: tS7Variable[], endpoint: S7Endpoint) {
        this._variables = rtArray(S7Variable).check(variables);

        for (let i = 0; i < this._variables.length; i++) {
            const variable = this._variables[i];
            this.pushVariableToMap(variable, i);
        }
        this._endpoint = endpoint;
    }

    private pushVariableToMap(variable: tS7Variable, index: number) {
        let key: string;
        if (variable.area === "DB") {
            key = `DB${variable.dbNr}`;
        } else {
            key = `${variable.area}`;
        }
        const list: tS7Variable[] = this._varsByArea.get(key) ?? [];
        list.push(variable);
        this._varsByArea.set(key, list);

        const indexList: number[] = this._indexesByArea.get(key) ?? [];
        indexList.push(index);
        this._indexesByArea.set(key, indexList);
    }
}
