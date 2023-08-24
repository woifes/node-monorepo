// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { Inverter, NodeYasdi, inverterValues } from "@woifes/node-yasdi";
import express, { Express, NextFunction, Request, Response } from "express";

export interface InverterRequest extends Request {
    inverter: Inverter;
}

export class YasdiRest {
    private nodeYasdi: NodeYasdi;
    private express: Express;

    constructor(
        id: string,
        deviceCount: number,
        port: number,
        tmpDir: string,
        serialDevice: string,
        yasdiDebug = false,
    ) {
        this.nodeYasdi = new NodeYasdi(
            id,
            {
                expectedDeviceCount: deviceCount,
                serialPorts: [serialDevice],
                iniFileDir: tmpDir,
            },
            undefined,
            yasdiDebug,
        );

        this.express = express();
        this.express.listen(port);
        this.express.use(this.yasdiSearchNotFinishedMiddleware.bind(this));
        this.express.get("/deviceSerials", this.getDeviceSerials.bind(this));

        this.express.use(
            "/:serial/values",
            this.inverterNotFoundMiddleware.bind(this),
        );
        this.express.get("/:serial/values", this.getDeviceValues.bind(this));

        this.express.use(
            "/:serial/data",
            this.inverterNotFoundMiddleware.bind(this),
        );
        this.express.get("/:serial/data", this.getDeviceMetadata.bind(this));
    }

    private yasdiSearchNotFinishedMiddleware(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        if (!this.nodeYasdi.deviceSearchFinished) {
            res.status(503).send("Device Search not finished yet");
            return;
        }
        next();
    }

    private inverterNotFoundMiddleware(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const deviceSerial = parseInt(req.params.serial);
        const inverter = this.nodeYasdi.getInverterBySerial(deviceSerial);
        if (inverter === undefined) {
            res.status(404).send(
                `Device with serial ${deviceSerial} not found`,
            );
            return;
        }
        (req as InverterRequest).inverter = inverter;
        next();
    }

    private getDeviceSerials(req: Request, res: Response) {
        const serials = this.nodeYasdi.serials;
        res.status(200).json(serials);
    }

    private getDeviceValues(req: Request, res: Response) {
        const inverter = (req as InverterRequest).inverter;
        inverter
            .getData(0)
            .then((values: inverterValues) => {
                res.status(200).json(Object.fromEntries(values));
            })
            .catch(() => {
                res.status(500).send("An unexpected Error occurred");
            });
    }

    private getDeviceMetadata(req: Request, res: Response) {
        const inverter = (req as InverterRequest).inverter;
        const metaData = {
            serial: inverter.serial,
            name: inverter.name,
            type: inverter.type,
        };
        res.status(200).json(metaData);
    }
}
