// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { readFileSync, writeFileSync } from "fs";
import stringify from "json-stringify-pretty-compact";
import { join } from "path";
import * as rt from "runtypes";
import { deepObjectMerge } from "../src/deepObjectMerge";
import { PersistantRuntype } from "../src/PersistentRuntype";
jest.mock("fs");
const readFileSyncMock = readFileSync as jest.Mock;
const writeFileSyncMock = writeFileSync as jest.Mock;

const filePath = join("path", "to", "file");

const testRuntype = rt.Record({
    a: rt.Array(rt.String),
    b: rt.Number,
    c: rt.String,
});

let defaultValue = { a: ["A", "B", "C"], b: 123, c: "Hello" };
let strDefaultValue = stringify(defaultValue);

let subDefaultValue = { b: 999, c: "subset" };
let strSubDefaultValue = stringify(subDefaultValue);

let superDefaultValue = {
    a: ["AA", "BB", "CC"],
    b: 123,
    c: "Hello",
    d: { e: "super", f: -3 },
};
let strSuperDefaultValue = stringify(superDefaultValue);

let testValue = { a: ["D", "E", "F"], b: -9, c: "World" };
let strTestValue = stringify(testValue);

let valueBad = { a: ["A", "B", "C"], b: "no number", c: "Hello" };
let strValueBad = stringify(valueBad);

afterEach(() => {
    jest.clearAllMocks();

    defaultValue = { a: ["A", "B", "C"], b: 123, c: "Hello" };
    strDefaultValue = stringify(defaultValue);

    subDefaultValue = { b: 999, c: "subset" };
    strSubDefaultValue = stringify(subDefaultValue);

    superDefaultValue = {
        a: ["AA", "BB", "CC"],
        b: 123,
        c: "Hello",
        d: { e: "super", f: -3 },
    };
    strSuperDefaultValue = stringify(superDefaultValue);

    testValue = { a: ["D", "E", "F"], b: -9, c: "World" };
    strTestValue = stringify(testValue);

    valueBad = { a: ["A", "B", "C"], b: "no number", c: "Hello" };
    strValueBad = stringify(valueBad);
});

describe("creation tests", () => {
    it("should create file if none exists", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);
    });
    it("should use existing file (exact runtype match)", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            return strDefaultValue;
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).not.toBeCalled();
    });
    it("should override file if content of file is not matching runtype", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            return strValueBad;
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);
    });
    it("should merged incomming file content if content is a subset of runtype", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            return strSubDefaultValue;
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(
            deepObjectMerge(defaultValue, subDefaultValue)
        );
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(
            stringify(deepObjectMerge(defaultValue, subDefaultValue))
        );
    });
    it("should not merged incomming file content if content is a subset of runtype (option set)", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            return strSubDefaultValue;
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue, {
            noMergeAtLoad: true,
        });
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);
    });
    it("should use file content which is a superset of runtype", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            return strSuperDefaultValue;
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(superDefaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).not.toBeCalled();
    });
    it("should always return a brand new object as value", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue() === pr.getValue()).toBe(false);
    });
});

describe("reload file test", () => {
    it("should create file if it does not exist (anymore)", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);

        pr.setValue(testValue);

        jest.clearAllMocks();

        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        expect(pr.getValue()).toEqual(testValue);
        expect(pr.readFileFromDisk()).toBe(false);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strTestValue);
    });
    it("should reload file if content confirms to the runtype (exact match)", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file not found");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);

        jest.clearAllMocks();

        readFileSyncMock.mockImplementationOnce(() => {
            return strTestValue;
        });

        expect(pr.readFileFromDisk()).toBe(true);
        expect(pr.getValue()).toEqual(testValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).not.toBeCalled();
    });
    it("should not reaload if content does not confirm to runtype", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);

        jest.clearAllMocks();

        readFileSyncMock.mockImplementationOnce(() => {
            return strValueBad;
        });

        expect(pr.readFileFromDisk()).toBe(false);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);
    });
    it("should merge incoming content if it is a subset of runtype", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);

        jest.clearAllMocks();

        readFileSyncMock.mockImplementationOnce(() => {
            return strSubDefaultValue;
        });

        expect(pr.readFileFromDisk()).toBe(true);
        expect(pr.getValue()).toEqual(
            deepObjectMerge(defaultValue, subDefaultValue)
        );
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(
            stringify(deepObjectMerge(defaultValue, subDefaultValue))
        );
    });
    it("should not merge at reload when option is set", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist -");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue, {
            noMergeAtLoad: true,
        });
        expect(pr.getValue()).toEqual(defaultValue);

        jest.clearAllMocks();

        readFileSyncMock.mockImplementationOnce(() => {
            return strSubDefaultValue;
        });

        expect(pr.readFileFromDisk()).toBe(false);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);
    });
    it("should use content if it is a superset of runtype", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        expect(pr.getValue()).toEqual(defaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strDefaultValue);

        jest.clearAllMocks();

        readFileSyncMock.mockImplementationOnce(() => {
            return strSuperDefaultValue;
        });

        expect(pr.readFileFromDisk()).toBe(true);
        expect(pr.getValue()).toEqual(superDefaultValue);
        expect(readFileSyncMock).toBeCalledTimes(1);
        expect(readFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(readFileSyncMock.mock.calls[0][1]).toBe("utf-8");
        expect(writeFileSyncMock).not.toBeCalled();
    });
});

describe("set value test", () => {
    it("should write file if value is set and confirms to runtype (exact match)", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        jest.clearAllMocks();
        expect(pr.setValue(testValue)).toBe(true);
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strTestValue);
    });
    it("should do nothing when value does not confirm to runtype", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        jest.clearAllMocks();
        expect(pr.setValue(valueBad as any)).toBe(false);
        expect(writeFileSyncMock).not.toBeCalled();
    });
    it("should merge incoming value if it is a subset of runtype", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        jest.clearAllMocks();
        expect(pr.setValue(subDefaultValue as any)).toBe(true);
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(
            stringify(deepObjectMerge(defaultValue, subDefaultValue))
        );
    });
    it("should not merge incoming value if option is set", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue, {
            noMergeAtSet: true,
        });
        jest.clearAllMocks();
        expect(pr.setValue(subDefaultValue as any)).toBe(false);
        expect(writeFileSyncMock).not.toBeCalled();
    });
    it("should use value if it is a superset of runtype", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        jest.clearAllMocks();
        expect(pr.setValue(superDefaultValue)).toBe(true);
        expect(writeFileSyncMock).toBeCalledTimes(1);
        expect(writeFileSyncMock.mock.calls[0][0]).toBe(filePath);
        expect(writeFileSyncMock.mock.calls[0][1]).toBe(strSuperDefaultValue);
    });
    it("should not write file if value is deep equal to already set value", () => {
        readFileSyncMock.mockImplementationOnce(() => {
            throw new Error("file does not exist");
        });
        const pr = new PersistantRuntype(filePath, testRuntype, defaultValue);
        jest.clearAllMocks();
        expect(pr.setValue(JSON.parse(JSON.stringify(defaultValue)))).toBe(
            true
        ); //make a copy so it is not exactly the same object
        expect(writeFileSyncMock).not.toBeCalled();
    });
});
