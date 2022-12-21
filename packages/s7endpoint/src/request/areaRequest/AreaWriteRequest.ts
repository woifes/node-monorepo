// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { S7Endpoint } from "../../S7Endpoint";
import { tS7Variable } from "../../types/S7Variable";
import { combineContAddresses } from "../util/combineContAddresses";
import { genVariableBuffer } from "../util/genVariableBuffer";
import { getBoundsOfVarSet } from "../util/getBoundsOfVarSet";
import { setBitInBuffer } from "../util/setBitInBuffer";
import { toggleBitInBuffer } from "../util/toggleBitInBuffer";
import { AreaRequest } from "./AreaRequest";

export class AreaWriteRequest extends AreaRequest {
    _combineVariables: tS7Variable[][];

    constructor(variables: tS7Variable[], endpoint: S7Endpoint) {
        super(variables, endpoint);

        for (let i = 0; i < this._variables.length; i++) {
            if (variables[i].value == undefined) {
                throw new Error(
                    `Write request variable witout value at index: ${i}`
                );
            }
        }

        this._combineVariables = combineContAddresses(this._variables);
    }

    /**
     * Combines continuos and overlapping variables to a set. Then writes each set individually.
     * If a set contains a BIT or ARRAY_OF_BIT the DB will be first read modified and then written back
     * @returns Promise of all operations
     */
    async execute() {
        const promises = [];

        for (const set of this._combineVariables) {
            promises.push(this.writeAllInOne(set));
        }

        return Promise.all(promises);
    }

    /**
     * Write the given variables in one request to the db
     * If at least one BIT or ARRAY_OF_BIT is in the set.
     * The DB will first be read before write.
     * @param variables
     */
    private async writeAllInOne(variables: tS7Variable[]) {
        const [start, end] = getBoundsOfVarSet(variables); //DbRequest.lengthOfVarSet(variables);
        const length = end - start;
        let buf: Buffer;

        if (variables.some((v) => v.type == "BIT")) {
            //at least one bit variable present
            buf = await this._endpoint.readAreaBytes(
                this._area,
                this._dbNr ?? 0,
                start,
                length
            );
        } else {
            buf = Buffer.alloc(length);
        }

        for (let i = 0; i < variables.length; i++) {
            const variable = variables[i];
            const startOfVar = variable.byteIndex - start;
            const writeBuf = buf.slice(startOfVar);
            if (variable.type == "BIT") {
                if (variable.count == undefined) {
                    if (variable.value == 2) {
                        toggleBitInBuffer(writeBuf, variable.bitIndex!);
                    } else {
                        setBitInBuffer(
                            variable.value == 1,
                            writeBuf,
                            variable.bitIndex!
                        );
                    }
                } else {
                    const value = variable.value as number[];
                    let bitIndex = variable.bitIndex!;
                    for (let i = 0; i < value.length; i++) {
                        if (value[i] == 2) {
                            toggleBitInBuffer(writeBuf, bitIndex);
                        } else {
                            setBitInBuffer(value[i] == 1, writeBuf, bitIndex);
                        }
                        bitIndex++;
                    }
                }
            } else {
                const varBuf: Buffer = genVariableBuffer(variable);
                varBuf.copy(writeBuf);
            }
        }

        await this._endpoint.writeAreaBytes(
            this._area,
            this._dbNr ?? 0,
            start,
            buf
        );
    }
}
