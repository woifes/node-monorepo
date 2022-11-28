// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { deepStrictEqual } from "assert";
import { readFileSync, writeFileSync } from "fs";
import stringify from "json-stringify-pretty-compact";
import { parse } from "json5";
import * as rt from "runtypes";
import { deepObjectMerge } from "./deepObjectMerge";

/* eslint-disable-next-line @typescript-eslint/ban-types */
function deepEqualsObject<T>(actual: T, expected: T) {
    try {
        deepStrictEqual(actual, expected);
        return true;
    } catch {
        return false;
    }
}

/**
 * @param noMergeAtSet forbidds the merging of the existing value to a new value (so it overrides the existing value)
 * @param noMergeAtLoad forbidds the mergin at startup (default value with existing value on disc)
 */
export type PersistantRuntypeOpts = {
    noMergeAtSet?: boolean;
    noMergeAtLoad?: boolean;
};

export class PersistantRuntype<T> {
    private _value: T;
    private _filePath: string;
    private _runtype: rt.Runtype<T>;
    private _noMergeAtSet: boolean;
    private _noMergeAtLoad: boolean;

    /**
     * Handles a object value which is hold persistant on the file system as a json file
     * Supports merging of objects either from disc or at write.
     * * On Set means to merge an incoming value with the existing one. This is tolerated if the runtype still validates
     * * On Load mean to merge the existing (persisted) value on the disc with the default value
     * @param filePath path where the json file should be stored
     * @param runtype the runtype representing the value to persist
     * @param def the default (start) value if no file exists
     * @param opts options object for the class
     */
    constructor(
        filePath: string,
        runtype: rt.Runtype<T>,
        def: T,
        opts?: PersistantRuntypeOpts
    ) {
        opts = opts ?? {};
        this._noMergeAtSet = opts.noMergeAtSet ?? false;
        this._noMergeAtLoad = opts.noMergeAtLoad ?? false;
        this._filePath = filePath;
        this._runtype = runtype;
        this._value = this._runtype.check(def);
        this.readFileFromDisk();
    }

    private testValue(value: T, noMerge: boolean) {
        let merged: unknown;
        if (!noMerge) {
            merged = deepObjectMerge(this._value, value);
        } else {
            merged = value;
        }
        this._value = this._runtype.check(merged);
    }

    /**
     * Triggers the reading of the persistance file.
     * @returns true on an successfull read, false if not. In the false case the default value is written to the file
     */
    readFileFromDisk() {
        try {
            const conent = readFileSync(this._filePath, "utf-8");
            const parsedObj = parse(conent);
            const isSubSet = !(<boolean>(
                this._runtype.validate(parsedObj).success
            ));
            this.testValue(parsedObj, this._noMergeAtLoad);
            if (isSubSet) {
                //if we come here without throwing it means the value in the file was a subset of the runtype.
                //(Because before it did not match and now it does)
                //Write back the new result to match
                this.writeFile();
            }
            return true;
        } catch (e) {
            this.writeFile();
            return false;
        }
    }

    private writeFile() {
        writeFileSync(this._filePath, stringify(this._value)); //at this point it is guaranteed that the value confirms to the runtype (either exact or as superset)
    }

    /**
     * Setter for the value. Triggers a read on each set
     * @param v the value to set
     * @returns true if successfull, false if either write error or incoming value does not validate to the runtype
     */
    setValue(v: T): boolean {
        try {
            if (!deepEqualsObject(v, this._value)) {
                this.testValue(v, this._noMergeAtSet);
                this.writeFile();
            }
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @returns the value (does not trigger a read from disc)
     */
    getValue(): T {
        return { ...this._value };
    }
}
