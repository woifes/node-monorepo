// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { once } from "events";
import { join } from "path";
import { emptyDirSync, mkdirSync, readFileSync, rmdirSync } from "fs-extra";
import { S7LocalEndpoint, tS7LocalEndpointConfig } from "../../src/local";
import { S7RemoteEndpoint } from "../../src/remote";

async function wait(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

const TMP_DIR = join(__dirname, "tmp");

beforeAll(() => {
    try {
        emptyDirSync(TMP_DIR);
        rmdirSync(TMP_DIR);
    } catch {
    } finally {
        mkdirSync(TMP_DIR);
    }
});

afterAll(() => {
    emptyDirSync(TMP_DIR);
    rmdirSync(TMP_DIR);
});

describe("creation tests", () => {
    it("should create the correct DBs", async () => {
        const config: tS7LocalEndpointConfig = {
            name: "test01",
            datablocks: {
                1: {
                    vars: [
                        {
                            name: "var01",
                            area: "DB",
                            type: "UINT8",
                            byteIndex: 0,
                        },
                    ],
                },
                2: {
                    vars: join(__dirname, "TestSource.txt"),
                },
            },
            datablockCsvDir: TMP_DIR,
        };
        const s7ep = new S7LocalEndpoint(config);
        await wait(200);
        const db1 = (s7ep as any).getArea(1) as Buffer;
        const db2 = (s7ep as any).getArea(2) as Buffer;
        expect(db1.length).toBe(1);
        expect(db2.length).toBe(26);
        const csv = readFileSync(join(TMP_DIR, "test01_DBs.csv"), "utf-8")
            .split("\n")
            .splice(1, 15); //only content rows
        expect(csv.sort().join("\n")).toBe(`var01;Standard-Variablentabelle;Con01;<No Value>;Byte;1;Binary;Absolute access;%DB1.DBB0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_10;Standard-Variablentabelle;Con01;<No Value>;DWord;4;Binary;Absolute access;%DB2.DBD18;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_11;Standard-Variablentabelle;Con01;<No Value>;Real;4;Binary;Absolute access;%DB2.DBD22;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_1_1;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB2.DBX0.0;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_1_2;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB2.DBX0.1;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_1_3;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB2.DBX0.2;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_1_4;Standard-Variablentabelle;Con01;<No Value>;Bool;1;Binary;Absolute access;%DB2.DBX0.3;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_2;Standard-Variablentabelle;Con01;<No Value>;Byte;1;Binary;Absolute access;%DB2.DBB1;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_3;Standard-Variablentabelle;Con01;<No Value>;Word;2;Binary;Absolute access;%DB2.DBW2;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_4;Standard-Variablentabelle;Con01;<No Value>;SInt;1;Binary;Absolute access;%DB2.DBB4;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_5;Standard-Variablentabelle;Con01;<No Value>;Byte;1;Binary;Absolute access;%DB2.DBB5;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_6;Standard-Variablentabelle;Con01;<No Value>;Int;2;Binary;Absolute access;%DB2.DBW6;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_7;Standard-Variablentabelle;Con01;<No Value>;Word;2;Binary;Absolute access;%DB2.DBW8;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_8;Standard-Variablentabelle;Con01;<No Value>;DInt;4;Binary;Absolute access;%DB2.DBD10;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0
var_9;Standard-Variablentabelle;Con01;<No Value>;DWord;4;Binary;Absolute access;%DB2.DBD14;False;<No Value>;<No Value>;0;Cyclic in operation;1 s;None;<No Value>;None;<No Value>;False;10;0;100;0`);
        s7ep.stop();
    });
});

describe("client operations", () => {
    let local: S7LocalEndpoint;
    let remote: S7RemoteEndpoint;

    beforeEach(async () => {
        local = new S7LocalEndpoint({
            name: "local02",
            datablocks: {
                1: {
                    vars: [
                        {
                            name: "var01",
                            area: "DB",
                            type: "UINT8",
                            byteIndex: 0,
                        },
                        {
                            name: "var01",
                            area: "DB",
                            type: "BIT",
                            byteIndex: 6,
                            bitIndex: 4,
                        },
                        {
                            name: "var01",
                            area: "DB",
                            type: "INT32",
                            byteIndex: 10,
                        },
                    ],
                },
                2: {
                    vars: join(__dirname, "TestSource.txt"),
                },
            },
            datablockCsvDir: TMP_DIR,
        });
        local.connect();
        remote = new S7RemoteEndpoint({
            endpointIp: "127.0.0.1",
            name: "remote02",
            rack: 10,
            slot: 1,
            selfRack: 20,
            selfSlot: 1,
        });
        remote.connect();
        if (!remote.connected) {
            await once(remote, "connect");
        }
    });

    afterEach(async () => {
        local.stop();
        remote.stop();
        await wait(500);
    });

    describe("read operation", () => {
        it("should read DB correctly", async () => {
            const remoteWR = remote.createWriteRequest([
                {
                    name: "1",
                    area: "DB",
                    dbNr: 1,
                    byteIndex: 6,
                    bitIndex: 4,
                    type: "BIT",
                    value: 1,
                },
                {
                    name: "2",
                    area: "DB",
                    dbNr: 1,
                    type: "INT32",
                    byteIndex: 10,
                    value: 1234,
                },
                {
                    name: "3",
                    area: "DB",
                    dbNr: 2,
                    type: "INT32",
                    byteIndex: 10,
                    value: 4321,
                },
            ]);
            const localRR = local.createReadRequest([
                {
                    name: "a",
                    area: "DB",
                    dbNr: 1,
                    byteIndex: 6,
                    bitIndex: 4,
                    type: "BIT",
                },
                {
                    name: "b",
                    area: "DB",
                    dbNr: 1,
                    type: "INT32",
                    byteIndex: 10,
                },
                {
                    name: "c",
                    area: "DB",
                    dbNr: 2,
                    type: "INT32",
                    byteIndex: 10,
                },
            ]);
            await remoteWR.execute();
            const result = await localRR.execute();
            expect(result[0].value).toBe(1);
            expect(result[1].value).toBe(1234);
            expect(result[2].value).toBe(4321);
        });

        it("should reject when wrong boundarys are requested", async () => {
            const localRR = local.createReadRequest([
                {
                    name: "a",
                    area: "DB",
                    dbNr: 1,
                    byteIndex: 20,
                    bitIndex: 4,
                    type: "UINT32",
                }, //wrong index
            ]);
            try {
                await localRR.execute();
                fail("should throw");
            } catch {}
        });

        it("should reject on other error", async () => {
            const localRR = local.createReadRequest([
                {
                    name: "a",
                    area: "DB",
                    dbNr: 99,
                    byteIndex: 6,
                    bitIndex: 4,
                    type: "BIT",
                }, //wrong dbNr
            ]);
            try {
                await localRR.execute();
                fail("should throw");
            } catch {}
        });
    });

    describe("write operation", () => {
        it("should write DB correctly", async () => {
            const localWR = local.createWriteRequest([
                {
                    name: "1",
                    area: "DB",
                    dbNr: 1,
                    byteIndex: 6,
                    bitIndex: 4,
                    type: "BIT",
                    value: 1,
                },
                {
                    name: "2",
                    area: "DB",
                    dbNr: 1,
                    type: "INT32",
                    byteIndex: 10,
                    value: 1234,
                },
                {
                    name: "3",
                    area: "DB",
                    dbNr: 2,
                    type: "INT32",
                    byteIndex: 10,
                    value: 4321,
                },
            ]);
            const remoteRR = remote.createReadRequest([
                {
                    name: "a",
                    area: "DB",
                    dbNr: 1,
                    byteIndex: 6,
                    bitIndex: 4,
                    type: "BIT",
                },
                {
                    name: "b",
                    area: "DB",
                    dbNr: 1,
                    type: "INT32",
                    byteIndex: 10,
                },
                {
                    name: "c",
                    area: "DB",
                    dbNr: 2,
                    type: "INT32",
                    byteIndex: 10,
                },
            ]);
            await localWR.execute();
            const result = await remoteRR.execute();
            expect(result[0].value).toBe(1);
            expect(result[1].value).toBe(1234);
            expect(result[2].value).toBe(4321);
        });

        it("should reject when wrong boundarys are requested", async () => {
            const localWR = local.createWriteRequest([
                {
                    name: "a",
                    area: "DB",
                    dbNr: 1,
                    byteIndex: 20,
                    bitIndex: 4,
                    type: "UINT32",
                    value: 123,
                }, //wrong index
            ]);
            try {
                await localWR.execute();
                fail("should throw");
            } catch {}
        });

        it("should reject on other error", async () => {
            const localWR = local.createWriteRequest([
                {
                    name: "a",
                    area: "DB",
                    dbNr: 99,
                    byteIndex: 6,
                    bitIndex: 4,
                    type: "BIT",
                    value: 1,
                }, //wrong dbNr
            ]);
            try {
                await localWR.execute();
                fail("should throw");
            } catch {}
        });
    });
});
