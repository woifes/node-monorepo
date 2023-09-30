// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { TestServer } from "@woifes/s7endpoint/test/TestServer";

const SIGNAL_DB_NR_OFFSET = 1;
const ACKOUT_DB_NR_OFFSET = 2;
const ACKIN_DB_NR_OFFSET = 3;

export class TestAlarmSource {
    static bufferFromBoolArray(arr: boolean[]) {
        const buf = Buffer.alloc(Math.ceil(arr.length / 8));
        for (let i = 0; i < arr.length; i++) {
            this.setBitInBuffer(buf, i, arr[i]);
        }
        return buf;
    }

    static setBitInBuffer(buf: Buffer, bitPos: number, value: boolean) {
        const bytePos = Math.floor(bitPos / 8);
        bitPos = bitPos % 8;
        let byte = buf[bytePos];
        if (value) {
            byte |= 1 << bitPos;
        } else {
            byte &= 0xff ^ (1 << bitPos);
        }
        buf[bytePos] = byte;
    }

    static getBitInBuffer(buf: Buffer, bitPos: number): boolean {
        const bytePos = Math.floor(bitPos / 8);
        bitPos = bitPos % 8;
        const byte = buf[bytePos];
        return (byte & (1 << bitPos)) > 0;
    }

    private _dbNumberBase: number;
    private _s7srv: TestServer;
    private _signals: boolean[] = [];
    private _ackOuts: boolean[] = [];
    private _ackIns: boolean[] = [];

    constructor(alarmCount: number, dbNumberBase: number, testSrv: TestServer) {
        this._dbNumberBase = dbNumberBase;
        this._s7srv = testSrv;
        for (let i = 0; i < alarmCount; i++) {
            this._signals.push(false);
            this._ackOuts.push(false);
            this._ackIns.push(false);
        }
        this.signalsDb = TestAlarmSource.bufferFromBoolArray(this._signals);
    }

    get dbNumberBase() {
        return this._dbNumberBase;
    }

    get signalDbNr() {
        return SIGNAL_DB_NR_OFFSET + this._dbNumberBase;
    }

    get ackOutDbNr() {
        return ACKOUT_DB_NR_OFFSET + this._dbNumberBase;
    }

    get ackInDbNr() {
        return ACKIN_DB_NR_OFFSET + this._dbNumberBase;
    }

    set signalsDb(db: Buffer) {
        this._s7srv.setArea(this.signalDbNr, db);
    }

    get signalsDb(): Buffer {
        return this._s7srv.getDbArea(this.signalDbNr);
    }

    set ackOutDb(db: Buffer) {
        this._s7srv.setArea(this.ackOutDbNr, db);
    }

    get ackOutDb(): Buffer {
        return this._s7srv.getDbArea(this.ackOutDbNr);
    }

    set ackInDb(db: Buffer) {
        this._s7srv.setArea(this.ackInDbNr, db);
    }

    get ackInDb(): Buffer {
        return this._s7srv.getDbArea(this.ackInDbNr);
    }

    setSignal(nr: number, value: boolean) {
        const db = this.signalsDb;
        TestAlarmSource.setBitInBuffer(db, nr, value);
        this.signalsDb = db;
    }

    getSignal(nr: number): boolean {
        const db = this.signalsDb;
        return TestAlarmSource.getBitInBuffer(db, nr);
    }

    setAckOut(nr: number, value: boolean) {
        const db = this.ackOutDb;
        TestAlarmSource.setBitInBuffer(db, nr, value);
        this.ackOutDb = db;
    }

    getAckOut(nr: number): boolean {
        const db = this.ackOutDb;
        return TestAlarmSource.getBitInBuffer(db, nr);
    }

    setAckIn(nr: number, value: boolean) {
        const db = this.ackInDb;
        TestAlarmSource.setBitInBuffer(db, nr, value);
        this.ackInDb = db;
    }

    getAckIn(nr: number): boolean {
        const db = this.ackInDb;
        return TestAlarmSource.getBitInBuffer(db, nr);
    }

    setArea(dbNr: number, buf: Buffer) {
        this._s7srv.setArea(dbNr + this._dbNumberBase, buf);
    }

    getArea(dbNr: number) {
        return this._s7srv.getDbArea(dbNr + this._dbNumberBase);
    }
}
