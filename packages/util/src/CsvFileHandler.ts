// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { EventEmitter } from "events";
import {
    appendFileSync,
    createReadStream,
    existsSync,
    readFileSync,
    renameSync,
    statSync,
    unlinkSync,
} from "fs-extra";
import { join } from "path";
import { createInterface } from "readline";

/**
 * @property maxFileSizeMB the maximal file size
 * @property header the header for csv mode
 * @property fileExtension file extension to use for the file
 * @property csvSeparator - default: ';'
 */
export interface CsvFileHandlerOptions {
    maxFileSizeMB: number;
    header?: string[];
    fileExtension?: string;
    csvSeparator?: string;
    addTimeStamp?: boolean;
}

export class CsvFileHandler {
    private _fileName: string;
    private _maxFileSize = 0;
    private _dirPath: string;
    private _actFileSize: number;
    private _fileExtension: string;
    private _csvSeparator: string;
    private _header?: string[];
    private _addTimeStamp: boolean;

    /**
     * Returns a string with YYYY-MM-DD hh:mm:ss.ms
     * @param moment Date or unix timestamp in ms to use. Uses Date.now() if not set
     * @returns
     */
    static getTimeStamp(moment?: Date | number): string {
        let now: Date;
        if (moment instanceof Date) {
            now = moment;
        } else if (typeof moment == "number") {
            now = new Date(moment);
        } else {
            now = new Date();
        }
        const year = ("0000" + now.getFullYear()).slice(-4);
        const month = ("00" + (now.getMonth() + 1)).slice(-2);
        const day = ("00" + now.getDate()).slice(-2);

        const hours = ("00" + now.getHours()).slice(-2);
        const minutes = ("00" + now.getMinutes()).slice(-2);
        const seconds = ("00" + now.getSeconds()).slice(-2);
        const milliseconds = ("000" + now.getMilliseconds()).slice(-3);

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
    }

    /**
     * Handles a csv file. An existing file will be reused. If it does not exist it will be created (with header).
     * If the file exceeds the given limit, it will be renamed with extension '.old.' before the file extension.
     * @param fileName the file name to use
     * @param dirPath the directory where the file(s) are stored
     * @param opts additional options
     */
    constructor(
        fileName: string,
        dirPath: string,
        opts: CsvFileHandlerOptions
    ) {
        this._fileExtension = opts.fileExtension ?? "";
        this._csvSeparator = opts.csvSeparator ?? ";";
        this._header = opts.header;
        this._addTimeStamp = opts.addTimeStamp ?? true;
        this._fileName = fileName;
        if (!(existsSync(dirPath) as boolean)) {
            throw new Error("Directory for csv file does not exist");
        }
        this._maxFileSize = opts.maxFileSizeMB * 1000000;
        this._dirPath = dirPath;

        this._actFileSize = this.setupFile();
    }

    get fileSize(): number {
        return this._actFileSize;
    }

    get fileName(): string {
        return this._fileName;
    }

    get fullFileName(): string {
        return this.genFullFileName(this._fileExtension);
    }

    get fullFilePath(): string {
        return this.genFullFilePath(this._fileExtension);
    }

    private genFullFileName(ext?: string): string {
        const extension = ext ?? this._fileExtension;
        return this._fileName + extension;
    }

    private genFullFilePath(ext?: string): string {
        return join(this._dirPath, this.genFullFileName(ext));
    }

    /**
     * Checks if file exists, creates if not. Returns file size
     */
    private setupFile(): number {
        if (!(existsSync(this.genFullFilePath()) as boolean)) {
            let content = "";
            if (this._header != undefined) {
                content = this.getHeader()! + "\n";
            }
            appendFileSync(this.genFullFilePath(), content);
            return statSync(this.genFullFilePath()).size; //file will be created at first append and size will be set
        } else {
            return statSync(this.genFullFilePath()).size;
        }
    }

    private getHeader(): string | undefined {
        let headerStr: string | undefined;
        if (this._header != undefined) {
            if (this._addTimeStamp) {
                headerStr =
                    "created" +
                    this._csvSeparator +
                    this._header!.join(this._csvSeparator);
            } else {
                headerStr = this._header!.join(this._csvSeparator);
            }
        }
        return headerStr;
    }

    private writeLineSync(line: string): boolean {
        try {
            if (this._actFileSize > this._maxFileSize) {
                renameSync(
                    this.genFullFilePath(),
                    this.genFullFilePath(".old" + this._fileExtension)
                );
                this._actFileSize = this.setupFile();
            }
            line = line + "\n";
            appendFileSync(this.genFullFilePath(), line);
            this._actFileSize += line.length;
            return true;
        } catch (e) {
            return false;
        }
    }

    private prepareLine(entries: string[]): string {
        const timeStamp: string = CsvFileHandler.getTimeStamp();

        if (this._addTimeStamp) {
            entries = [timeStamp, ...entries];
        }

        return entries.join(this._csvSeparator);
    }

    /**
     * Writes the given items with the optional timestamp joined by the csv separator
     * @param entries array of entries
     * @returns true on success, false on failure
     */
    writeLine(...entries: string[]): boolean {
        const prepared = this.prepareLine(entries);
        if (prepared.length > 0) {
            return this.writeLineSync(prepared);
        }
        return false;
    }

    /**
     * @returns the complete content of the file.
     */
    getContentSync() {
        try {
            return readFileSync(this.genFullFilePath());
        } catch {
            return Buffer.alloc(0);
        }
    }

    /**
     * Deletes the file and recreates it
     */
    deleteFileSync() {
        unlinkSync(this.genFullFilePath());
        this.setupFile();
    }

    /**
     * Generates an EventEmitter which emits lines filtered by a given filter
     * @param filter filter function which gets called with an array of string elements. Shall return true if the line has to be returned.
     * The header will also returned
     * @param checkAll if set every line will be checked. If not set (default) it is assumed that a continuos block will be selected.
     * If the filter returns true the first time the block starts and ends when the filter returns false the next time
     * @returns EventEmitter with two events:
     * * 'line' for every line
     * * 'end' when the end is reached
     */
    getLines(
        filter: (entries: string[]) => boolean,
        checkAll = false
    ): EventEmitter {
        const evtEmitter = new EventEmitter();
        let foundStart = false;
        let isClosed = false;
        try {
            const inStream = createReadStream(this.fullFilePath);
            const rl = createInterface({
                input: inStream,
            });
            const close = () => {
                inStream.close();
                rl.close();
                isClosed = true;
            };

            rl.on("line", (line: string) => {
                const entries = line.split(this._csvSeparator);
                if (isClosed) {
                    return;
                }
                let ok: boolean;
                try {
                    ok = filter(entries);
                } catch {
                    ok = false;
                }
                if (ok) {
                    evtEmitter.emit("line", line);
                    if (!foundStart) {
                        foundStart = true;
                    }
                } else {
                    if (foundStart && !checkAll) {
                        close();
                    }
                }
            });
            rl.on("close", () => {
                evtEmitter.emit("end");
            });
        } catch {
            process.nextTick(() => {
                evtEmitter.emit("end");
            });
        }
        return evtEmitter;
    }

    /**
     * Returns the lines of the underlying file, filtered by the provided filter
     * @param filter the filter function to use on each line. The header will also be checked
     * @param checkAll if set every line will be checked. If not set (default) it is assumed that a continuos block will be selected.
     * If the filter returns true the first time the block starts and ends when the filter returns false afterwards
     * @returns Promise which resolvers with an array of lines
     */
    async getAllLines(
        filter: (entries: string[]) => boolean,
        checkAll = false
    ): Promise<string[]> {
        return new Promise((resolve, reject) => {
            try {
                const evtEmitter = this.getLines(filter, checkAll);
                const result: string[] = [];
                evtEmitter.on("line", (line: string) => {
                    result.push(line);
                });
                evtEmitter.on("end", () => {
                    resolve(result);
                });
            } catch (e) {
                reject();
            }
        });
    }
}
