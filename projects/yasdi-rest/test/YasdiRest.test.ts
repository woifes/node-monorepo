// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import request from "supertest";
import { YasdiRest } from "../src/YasdiRest";

const PORT = 3000;
const YASDI_REST = new YasdiRest(
    "myYasdiRest",
    2,
    PORT,
    "tmpDir",
    "/dev/ttyUSB0",
    true,
);
const NODE_YASDI = (YASDI_REST as any).nodeYasdi;
const REQUEST = request(`http://localhost:${PORT}`);

beforeEach(() => {
    NODE_YASDI.serials = [];
    NODE_YASDI.deviceSearchFinished = false;
});

it("should send error if device search is not finished", async () => {
    await REQUEST.get("/serials").expect(503);
    await REQUEST.get("/device/123/values").expect(503);
    await REQUEST.get("/device/123/data").expect(503);
});

it("should send serial of found inverter", async () => {
    NODE_YASDI.serials = [123, 456];
    NODE_YASDI.deviceSearchFinished = true;
    const response = await REQUEST.get("/serials").expect(200);
    expect(response.body).toEqual([123, 456]);
});

describe("inverter get values tests", () => {
    beforeEach(() => {
        NODE_YASDI.serials = [123, 456];
        NODE_YASDI.deviceSearchFinished = true;
    });

    it("should send inverter values", async () => {
        const response = await REQUEST.get("/device/123/values").expect(200);
        expect(response.body).toEqual({
            val01: {
                statusText: "statusText01",
                timeStamp: "timestamp01",
                unit: "unit01",
                value: 1,
            },
            val02: {
                statusText: "statusText02",
                timeStamp: "timestamp02",
                unit: "unit02",
                value: 2,
            },
            val03: {
                statusText: "statusText03",
                timeStamp: "timestamp03",
                unit: "unit03",
                value: 3,
            },
        });
    });

    it("should send 404 when inverter not found", async () => {
        await REQUEST.get("/device/9999/values").expect(404);
    });
});

describe("inverter meta data tests", () => {
    beforeEach(() => {
        NODE_YASDI.serials = [123, 456];
        NODE_YASDI.deviceSearchFinished = true;
    });

    it("should send meta data", async () => {
        const response = await REQUEST.get("/device/123/data").expect(200);
        expect(response.body).toEqual({
            name: "inv01",
            serial: 123,
            type: "MyInverterType",
        });
    });

    it("should 404 when inverter was not found", async () => {
        await REQUEST.get("/9999/data").expect(404);
    });
});
