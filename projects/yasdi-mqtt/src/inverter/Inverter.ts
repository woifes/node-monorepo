// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Coordinates } from "../types/Coordinates";
import { InverterConfig, rtInverterConfig } from "./InverterConfig";
import { Orientation } from "../types/Orientation";
import { SunTraceInfo } from "../types/SunTraceInfo";

export class Inverter {
    private config: InverterConfig;
    private found = false;
    private sunTraceInfo?: SunTraceInfo;

    constructor(
        config: InverterConfig,
        coordinates?: Coordinates,
        orientation?: Orientation,
    ) {
        this.config = rtInverterConfig.check(config);
        const cords = this.config.coordinates ?? coordinates;
        const orien = this.config.orientation ?? orientation;
        if (cords !== undefined && orien !== undefined) {
            this.sunTraceInfo = {
                coordinates: cords,
                orientation: orien,
            };
        }
    }

    onNewDevice(serial: number) {
        if (this.config.serialNumber === serial) {
            this.found = true;
        }
    }

    onDeviceSearchEnd(serials: number[]) {
        if (this.found || this.config.serialNumber in serials) {
            this.found = true;
            return;
        }
        //TODO debug, expection?
    }

    get present(): boolean {
        return this.found;
    }
}
