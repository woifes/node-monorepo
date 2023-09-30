// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { S7AddressString, parseS7AddressString } from "@woifes/s7endpoint";
import * as rt from "runtypes";
import { S7EventConfig } from "../events/S7EventConfig";
//cmd/<cmdProviderClientId>/<cmdRequesterClientId>/<cmdName>
//cmdRes/<toClientId>/<fromClientId>/<cmdName>
export const S7CommandConfig = rt
    .Record({
        name: rt.String.withConstraint((s) => s.length > 0), //command name
        topicPrefix: rt.String.withConstraint((s) => s.length > 0).optional(), //standard is "cmd"
        cmdIdAddress: S7AddressString.withConstraint((variable) => {
            //address to store the u16 command id to
            const addressObject = parseS7AddressString(variable);
            return (
                addressObject.type === "UINT16" ||
                addressObject.type === "UINT32" ||
                addressObject.type === "INT32" ||
                "Command Id address has to be a compatible type"
            );
        }).optional(),
        params: rt
            .Array(
                //parameter to write down with the command
                S7AddressString,
            )
            .withConstraint((a) => {
                return (
                    a.length > 0 ||
                    "Params array has to have at least one param"
                );
            })
            .optional(),
        requiredParamCount: rt.Number.optional(),
        result: S7EventConfig.And(
            rt.Record({
                //result configuration if this is omitted no response will be send
                topicPrefix: rt.String.withConstraint(
                    (s) => s.length > 0,
                ).optional(), //standard is "cmdRes"
                timeoutMS: rt.Number.withConstraint(
                    (n) => n > 0 || "Timeout has to be greater than 0",
                ), //timeout when a failure response has to be send //standard will be 3s
                okFlagAddress: S7AddressString.withConstraint((variable) => {
                    const addressObject = parseS7AddressString(variable);
                    return (
                        addressObject.type === "UINT8" ||
                        "okFlagAddress has to point to a UINT8"
                    );
                }),
            }),
        ).optional(),
    })
    .withConstraint((config) => {
        if (config.cmdIdAddress === undefined && config.params === undefined) {
            return "cmdIdAddress and params can not both be undefined";
        }
        if (
            config.requiredParamCount !== undefined &&
            config.params !== undefined
        ) {
            return (
                config.requiredParamCount <= config.params.length ||
                "Required param count is bigger than param count"
            );
        }
        return true;
    });

export type tS7CommandConfig = rt.Static<typeof S7CommandConfig>;
