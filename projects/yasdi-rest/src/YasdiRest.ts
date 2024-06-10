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
    private startupTime: Date;
    private deviceSearchFinishedTime?: Date;

    constructor(
        private id: string,
        private deviceCount: number,
        port: number,
        tmpDir: string,
        private serialDevice: string,
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

        this.startupTime = new Date();

        this.express = express();
        this.express.listen(port);
        this.express.get("/", this.getYasdiRestStatus.bind(this));
        this.express.use(this.yasdiSearchNotFinishedMiddleware.bind(this));
        this.express.get("/serials", this.getDeviceSerials.bind(this));

        this.express.use(
            "/device/:serial",
            this.inverterNotFoundMiddleware.bind(this),
        );
        this.express.get(
            "/device/:serial/values",
            this.getDeviceValues.bind(this),
        );
        this.express.get(
            "/device/:serial/data",
            this.getDeviceMetadata.bind(this),
        );
        this.express.get("/values", this.getAllValues.bind(this));
    }

    private getYasdiRestStatus(req: Request, res: Response) {
        const statusInfo = {
            id: this.id,
            deviceCount: this.deviceCount,
            deviceFound: this.nodeYasdi.serials.length,
            deviceSerials: this.nodeYasdi.serials,
            serialDevice: this.serialDevice,
            startupTime: this.startupTime,
            deviceSearchFinishedTime: this.deviceSearchFinishedTime,
        };

        res.status(200).json(statusInfo);
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

    private async getAllValues(req: Request, res: Response) {
        const serials = this.nodeYasdi.serials;
        const resultData: Map<number, any> = new Map();
        for (const serial of serials) {
            try {
                const inverter = this.nodeYasdi.getInverterBySerial(serial)!;
                const values = await inverter.getData(0);
                values.entries();
                resultData.set(serial, Object.fromEntries(values.entries()));
            } catch {
                break;
            }
        }
        res.status(200).json(Object.fromEntries(resultData.entries()));
    }
}
