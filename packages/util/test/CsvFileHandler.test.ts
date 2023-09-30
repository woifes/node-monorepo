// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { join } from "path";
import {
    appendFileSync,
    existsSync,
    mkdirSync,
    readFileSync,
    removeSync,
    statSync,
    writeFileSync,
} from "fs-extra";
import { CsvFileHandler } from "../src/CsvFileHandler";

const TMP_DIR = join(__dirname, "tmp");

const TEST_DATE = new Date(2000, 1, 29, 12, 0);

beforeAll(() => {
    removeSync(TMP_DIR);
    mkdirSync(TMP_DIR);
    jest.useFakeTimers("modern");
    jest.setSystemTime(TEST_DATE);
});

afterEach(() => {
    jest.clearAllMocks();
});

afterAll(() => {
    removeSync(TMP_DIR);
});

describe("getTimeStamp", () => {
    it("should give the correct timestamp without argument", () => {
        expect(CsvFileHandler.getTimeStamp()).toBe("2000-02-29 12:00:00.000");
    });

    it("should give the correct timestamp with Date argument", () => {
        const d = new Date();
        expect(CsvFileHandler.getTimeStamp(d)).toBe("2000-02-29 12:00:00.000");
    });

    it("should give the correct timestamp with number argument", () => {
        const d = Date.now();
        expect(CsvFileHandler.getTimeStamp(d)).toBe("2000-02-29 12:00:00.000");
    });
});

describe("creation tests", () => {
    it("should create dir and setup file", () => {
        const lh = new CsvFileHandler("file01", TMP_DIR, { maxFileSizeMB: 1 });

        const stats = statSync(lh.fullFilePath);

        expect(stats.size).toBe(0);
    });

    it("use existing file if present", () => {
        appendFileSync(join(TMP_DIR, "file02"), "Hallo\n");

        const lh = new CsvFileHandler("file02", TMP_DIR, { maxFileSizeMB: 1 });
        const content = readFileSync(lh.fullFilePath).toString();

        expect(content).toBe("Hallo\n");
    });

    it("should initialize file with csv header", () => {
        const lh = new CsvFileHandler("file03", TMP_DIR, {
            maxFileSizeMB: 1,
            header: ["A", "B", "C"],
        });

        const content = readFileSync(lh.fullFilePath).toString();

        expect(content).toBe("created;A;B;C\n");
    });

    it("should throw if directory does not exit", () => {
        expect(() => {
            const lh = new CsvFileHandler("file04", join(TMP_DIR, "dir01"), {
                maxFileSizeMB: 1,
            });
        }).toThrow();
    });
});

describe("write line sync test", () => {
    it("should append file when write file is called", () => {
        const lh = new CsvFileHandler("file11", TMP_DIR, {
            maxFileSizeMB: 1,
            fileExtension: ".txt",
        });

        lh.writeLine("Hello World");

        const content = readFileSync(lh.fullFilePath).toString();
        expect(content).toBe("2000-02-29 12:00:00.000;Hello World\n");
    });

    it("should append file without timestamp", () => {
        const lh = new CsvFileHandler("file12", TMP_DIR, {
            maxFileSizeMB: 1,
            fileExtension: ".txt",
            addTimeStamp: false,
        });

        lh.writeLine("Hello World");

        const content = readFileSync(lh.fullFilePath).toString();
        expect(content).toBe("Hello World\n");
    });

    it("should rename the file when size gets to big", () => {
        const lh = new CsvFileHandler("file13", TMP_DIR, { maxFileSizeMB: 1 });
        (lh as any)._actFileSize = 1000001;

        lh.writeLine("Hello World");

        const content = readFileSync(lh.fullFilePath).toString();
        expect(existsSync(join(TMP_DIR, "file13.old"))).toBe(true);

        expect(content).toBe("2000-02-29 12:00:00.000;Hello World\n");
    });

    it("should append csv line", () => {
        const lh = new CsvFileHandler("file14", TMP_DIR, {
            maxFileSizeMB: 1,
            header: ["A", "B", "C"],
            fileExtension: ".csv",
            csvSeparator: "#",
        });

        let content = readFileSync(lh.fullFilePath).toString();

        expect(content).toBe("created#A#B#C\n");

        lh.writeLine("a123", "b456", "c789");

        content = readFileSync(lh.fullFilePath).toString();

        expect(content).toBe(
            "created#A#B#C\n2000-02-29 12:00:00.000#a123#b456#c789\n",
        );
    });

    it("should append csv line without timestamp", () => {
        const lh = new CsvFileHandler("file15", TMP_DIR, {
            maxFileSizeMB: 1,
            header: ["A", "B", "C"],
            fileExtension: ".csv",
            addTimeStamp: false,
        });

        let content = readFileSync(lh.fullFilePath).toString();

        expect(content).toBe("A;B;C\n");

        lh.writeLine("a123", "b456", "c789");

        content = readFileSync(lh.fullFilePath).toString();

        expect(content).toBe("A;B;C\na123;b456;c789\n");
    });

    it("should rename the csv file if size gets to large", () => {
        const lh = new CsvFileHandler("file16", TMP_DIR, {
            maxFileSizeMB: 1,
            header: ["A", "B", "C"],
            fileExtension: ".csv",
        });
        (lh as any)._actFileSize = 1000001;

        lh.writeLine("a123", "b456", "c789");

        const content = readFileSync(lh.fullFilePath).toString();
        const content2 = readFileSync(
            join(TMP_DIR, "file16.old.csv"),
        ).toString();

        expect(content).toBe(
            "created;A;B;C\n2000-02-29 12:00:00.000;a123;b456;c789\n",
        );
        expect(content2).toBe("created;A;B;C\n");
    });
});

describe("get content", () => {
    it("should give the whole fileconent", () => {
        const lh = new CsvFileHandler("file21", TMP_DIR, {
            maxFileSizeMB: 1,
            header: ["A", "B", "C"],
            fileExtension: ".csv",
        });

        expect(lh.getContentSync().toString()).toBe("created;A;B;C\n");
    });
});

describe("unlink sync", () => {
    it("shoud delete file", () => {
        writeFileSync(join(TMP_DIR, "file31"), "Test");

        expect(existsSync(join(TMP_DIR, "file31"))).toBe(true);

        const lh = new CsvFileHandler("file31", TMP_DIR, { maxFileSizeMB: 1 });

        lh.deleteFileSync();

        expect(readFileSync(lh.fullFilePath).toString()).toBe("");
    });

    it("should delete csv and setup new file", () => {
        writeFileSync(join(TMP_DIR, "file32"), "Test");

        expect(existsSync(join(TMP_DIR, "file32"))).toBe(true);

        const lh = new CsvFileHandler("file32", TMP_DIR, {
            maxFileSizeMB: 1,
            header: ["A", "B", "C"],
            fileExtension: ".csv",
        });

        lh.deleteFileSync();

        expect(readFileSync(lh.fullFilePath).toString()).toBe(
            "created;A;B;C\n",
        );
    });
});

describe("getLines tests", () => {
    let lh: CsvFileHandler;

    beforeAll(() => {
        lh = new CsvFileHandler("file41", TMP_DIR, {
            maxFileSizeMB: 1,
            fileExtension: ".csv",
            addTimeStamp: false,
        });
        for (let i = 0; i < 15; i++) {
            lh.writeLine(`${i}`);
        }
    });

    it("should filter all lines", (done) => {
        const filter = jest.fn().mockImplementation((entries: string[]) => {
            return parseInt(entries[0]) % 3 === 0;
        });
        const lineCb = jest.fn();
        const closeCb = jest.fn();

        const evt = lh.getLines(filter, true);
        evt.on("line", lineCb);
        evt.on(
            "end",
            closeCb.mockImplementationOnce(() => {
                expect(filter).toBeCalledTimes(15);
                expect(lineCb).toBeCalledTimes(5);
                const res = lineCb.mock.calls.map((value: any) => {
                    return value[0];
                });
                expect(res).toEqual(["0", "3", "6", "9", "12"]);
                done();
            }),
        );
    });

    it("should filter an block", (done) => {
        const filter = jest.fn().mockImplementation((entries: string[]) => {
            const n = parseInt(entries[0]);
            return n > 3 && n <= 7;
        });
        const lineCb = jest.fn();
        const closeCb = jest.fn();

        const evt = lh.getLines(filter, false);
        evt.on("line", lineCb);
        evt.on(
            "end",
            closeCb.mockImplementationOnce(() => {
                expect(filter).toBeCalledTimes(9);
                expect(lineCb).toBeCalledTimes(4);
                const res = lineCb.mock.calls.map((value: any) => {
                    return value[0];
                });
                expect(res).toEqual(["4", "5", "6", "7"]);
                done();
            }),
        );
    });
});

describe("getAllLines tests", () => {
    let lh: CsvFileHandler;

    beforeAll(() => {
        lh = new CsvFileHandler("file51", TMP_DIR, {
            maxFileSizeMB: 1,
            fileExtension: ".csv",
            addTimeStamp: false,
        });
        for (let i = 0; i < 15; i++) {
            lh.writeLine(`${i}`);
        }
    });

    it("should filter all lines", async () => {
        const filter = jest.fn().mockImplementation((entries: string[]) => {
            return parseInt(entries[0]) % 3 === 0;
        });

        const lines = await lh.getAllLines(filter, true);
        expect(lines).toEqual(["0", "3", "6", "9", "12"]);
        expect(filter).toBeCalledTimes(15);
    });

    it("should filter an block", async () => {
        const filter = jest.fn().mockImplementation((entries: string[]) => {
            const n = parseInt(entries[0]);
            return n > 3 && n <= 7;
        });

        const lines = await lh.getAllLines(filter, false);
        expect(lines).toEqual(["4", "5", "6", "7"]);
        expect(filter).toBeCalledTimes(9);
    });
});
