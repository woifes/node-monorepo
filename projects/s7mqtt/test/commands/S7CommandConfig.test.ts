// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { readFileSync } from "fs-extra";
import { join } from "path";
import { parse } from "yaml";
import { S7CommandConfig } from "../../src/commands/S7CommandConfig";

it("should validate example files", () => {
    const p1 = join(
        __dirname,
        "..",
        "..",
        "examples",
        "commands",
        "command01.example.yaml"
    );
    expect(() => {
        S7CommandConfig.check(parse(readFileSync(p1, "utf-8")));
    }).not.toThrow();
});

it("should validate correct runtype", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            topicPrefix: "test",
            cmdIdAddress: "DB1,DW0",
            params: ["DB1,DW0", "DB2,X1.2.3", "DB3,USInt4"],
            requiredParamCount: 2,
            result: {
                trigger: "DB4,W0",
                params: ["DB5,DW0", "DB6,X1.0.9", "DB7,SInt2"],
                okFlagAddress: "DB8,USInt2",
                pollIntervalMS: 500,
                topicPrefix: "answer",
                timeoutMS: 2500,
            },
        });
    }).not.toThrow();

    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            cmdIdAddress: "DB1,DW0",
            result: {
                trigger: "DB4,W0",
                okFlagAddress: "DB8,USInt2",
                timeoutMS: 1600,
            },
        });
    }).not.toThrow();

    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            params: ["DB5,DW0", "DB6,X1.0.9", "DB7,SInt2"],
            requiredParamCount: 2,
            result: {
                trigger: "DB4,W0",
                okFlagAddress: "DB8,USInt2",
                timeoutMS: 1600,
            },
        });
    }).not.toThrow();

    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            params: ["DB5,DW0", "DB6,X1.0.9", "DB7,SInt2"],
        });
    }).not.toThrow();
});

it("should not allow empty command name", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "",
            cmdIdAddress: "DB1,DW0",
            result: {
                trigger: "DB4,W0",
                okFlagAddress: "DB8,USInt2",
                timeoutMS: 1600,
            },
        });
    }).toThrow();
});

it("should not allow empty topic prefix", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            topicPrefix: "",
            cmdIdAddress: "DB1,DW0",
            result: {
                trigger: "DB4,W0",
                okFlagAddress: "DB8,USInt2",
                timeoutMS: 1600,
            },
        });
    }).toThrow();
});

it("should not allow wrong command id address type", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            cmdIdAddress: "DB1,R0",
            result: {
                trigger: "DB4,W0",
                okFlagAddress: "DB8,USInt2",
                timeoutMS: 1600,
            },
        });
    }).toThrow();
});

it("should not allow empty param array", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            params: [],
        });
    }).toThrow();
});

it("should not allow empty result topic prefix", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            params: ["DB1,DW0", "DB2,X1.2.3", "DB3,USInt4"],
            requiredParamCount: 2,
            result: {
                topicPrefix: "",
                trigger: "DB4,W0",
                okFlagAddress: "DB8,USInt2",
                timeoutMS: 1600,
            },
        });
    }).toThrow();
});

it("should not allow negative result timeout value", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            params: ["DB1,DW0", "DB2,X1.2.3", "DB3,USInt4"],
            requiredParamCount: 2,
            result: {
                timeoutMS: -1,
                trigger: "DB4,W0",
                okFlagAddress: "DB8,USInt2",
            },
        });
    }).toThrow();
});

it("should not allow wrong ok flag type", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            params: ["DB1,DW0", "DB2,X1.2.3", "DB3,USInt4"],
            requiredParamCount: 2,
            result: {
                trigger: "DB4,W0",
                okFlagAddress: "DB8,R2",
                timeoutMS: 1600,
            },
        });
    }).toThrow();
});

it("should not allow cmd id address and params undefined", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
        });
    }).toThrow();
});

it("should not allow bigger required param count than param count", () => {
    expect(() => {
        S7CommandConfig.check({
            name: "cmd01",
            topicPrefix: "test",
            cmdIdAddress: "DB1,DW0",
            params: ["DB1,DW0", "DB2,X1.2.3", "DB3,USInt4"],
            requiredParamCount: 4, //<
            result: {
                trigger: "DB4,W0",
                params: ["DB5,DW0", "DB6,X1.0.9", "DB7,SInt2"],
                okFlagAddress: "DB8,USInt2",
                pollIntervalMS: 500,
                topicPrefix: "answer",
                timeoutMS: 2500,
            },
        });
    }).toThrow();
});
