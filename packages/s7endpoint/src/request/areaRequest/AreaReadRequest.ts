// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { DataTypes } from "@woifes/binarytypes";
import { S7Endpoint } from "../../S7Endpoint";
import { tS7Variable } from "../../types/S7Variable";
import { getS7AddrSize } from "../../util/getS7AddrSize";
import { AreaRequest } from "./AreaRequest";

export class AreaReadRequest extends AreaRequest {
    async execute(): Promise<tS7Variable[]> {
        const result: tS7Variable[] = [];
        if (this._variables.length === 0) {
            throw new Error("No variables specified in AreaReadRequest");
        }
        try {
            const data = await this._endpoint.readAreaBytes(
                this._area,
                this._dbNr ?? 0,
                this._startIndex,
                this._length,
            );
            if (data.length === this._length) {
                for (let i = 0; i < this._variablesUnsorted.length; i++) {
                    const variable = this._variablesUnsorted[i];
                    const varSize = getS7AddrSize(variable);
                    const startInData = variable.byteIndex - this._startIndex;
                    const dataChunk = data.slice(
                        startInData,
                        startInData + varSize,
                    );

                    let value: any;

                    if (variable.type !== "BIT") {
                        if (variable.count === undefined) {
                            value = DataTypes[variable.type].fromBuffer(
                                dataChunk,
                                false,
                            );
                        } else {
                            value = DataTypes[
                                `ARRAY_OF_${variable.type}`
                            ].fromBuffer(dataChunk, false);
                        }
                    } else if (variable.type === "BIT") {
                        if (variable.count === undefined) {
                            value =
                                (dataChunk[0] & (0x1 << variable.bitIndex!)) > 0
                                    ? 1
                                    : 0;
                        } else {
                            value = [];
                            for (
                                let i = variable.bitIndex!;
                                i < variable.bitIndex! + variable.count!;
                                i++
                            ) {
                                const byteIndex = Math.floor(i / 8);
                                const bitRest = i % 8;
                                const bit =
                                    (dataChunk[byteIndex] & (0x1 << bitRest)) >
                                    0
                                        ? 1
                                        : 0;
                                (value as number[]).push(bit);
                            }
                        }
                    }
                    result[i] = {
                        ...variable,
                        value: value,
                    };
                }
                return result;
            } else {
                throw new Error(
                    "AreaReadRequest did not read enough bytes for request",
                );
            }
        } catch (e) {
            throw new Error(`Error occurred during AreaReadRequest: ${e}`);
        }
    }
}
