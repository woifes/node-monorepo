// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { FloatArrDataType } from "../src/FloatArrDataType";
import { FloatDataType } from "../src/FloatDataType";
import { IntArrDataType } from "../src/IntArrDataType";
import { IntDataType } from "../src/IntDataType";
import { TypeList } from "../src/TypeList";

test("INT8 integrity", () => {
    expect(TypeList.INT8.size).toBe(1);
    expect((TypeList.INT8 as any)._signed).toBe(true);
    expect(TypeList.INT8 instanceof IntDataType).toBe(true);
    expect(Object.isFrozen(TypeList.INT8)).toBe(true);
});

test("UINT8 integrity", () => {
    expect(TypeList.UINT8.size).toBe(1);
    expect((TypeList.UINT8 as any)._signed).toBe(false);
    expect(TypeList.UINT8 instanceof IntDataType).toBe(true);
    expect(Object.isFrozen(TypeList.UINT8)).toBe(true);
});

test("INT16 integrity", () => {
    expect(TypeList.INT16.size).toBe(2);
    expect((TypeList.INT16 as any)._signed).toBe(true);
    expect(TypeList.INT16 instanceof IntDataType).toBe(true);
    expect(Object.isFrozen(TypeList.INT16)).toBe(true);
});

test("UINT16 integrity", () => {
    expect(TypeList.UINT16.size).toBe(2);
    expect((TypeList.UINT16 as any)._signed).toBe(false);
    expect(TypeList.UINT16 instanceof IntDataType).toBe(true);
    expect(Object.isFrozen(TypeList.UINT16)).toBe(true);
});

test("INT32 integrity", () => {
    expect(TypeList.INT32.size).toBe(4);
    expect((TypeList.INT32 as any)._signed).toBe(true);
    expect(TypeList.INT32 instanceof IntDataType).toBe(true);
    expect(Object.isFrozen(TypeList.INT32)).toBe(true);
});

test("UINT32 integrity", () => {
    expect(TypeList.UINT32.size).toBe(4);
    expect((TypeList.UINT32 as any)._signed).toBe(false);
    expect(TypeList.UINT32 instanceof IntDataType).toBe(true);
    expect(Object.isFrozen(TypeList.UINT32)).toBe(true);
});

test("INT64 integrity", () => {
    expect(TypeList.INT64.size).toBe(8);
    expect((TypeList.INT64 as any)._signed).toBe(true);
    expect(TypeList.INT64 instanceof IntDataType).toBe(true);
    expect(Object.isFrozen(TypeList.INT64)).toBe(true);
});

test("UINT64 integrity", () => {
    expect(TypeList.UINT64.size).toBe(8);
    expect((TypeList.UINT64 as any)._signed).toBe(false);
    expect(TypeList.UINT64 instanceof IntDataType).toBe(true);
    expect(Object.isFrozen(TypeList.UINT64)).toBe(true);
});

test("FLOAT integrity", () => {
    expect(TypeList.FLOAT.size).toBe(4);
    expect(TypeList.FLOAT instanceof FloatDataType).toBe(true);
    expect(Object.isFrozen(TypeList.FLOAT)).toBe(true);
});

test("DOUBLE integrity", () => {
    expect(TypeList.DOUBLE.size).toBe(8);
    expect(TypeList.DOUBLE instanceof FloatDataType).toBe(true);
    expect(Object.isFrozen(TypeList.DOUBLE)).toBe(true);
});

test("ARRAY_OF_INT8 integrity", () => {
    expect(TypeList.ARRAY_OF_INT8.size).toBe(1);
    expect((TypeList.ARRAY_OF_INT8 as any)._signed).toBe(true);
    expect(TypeList.ARRAY_OF_INT8 instanceof IntArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_INT8)).toBe(true);
});

test("ARRAY_OF_UINT8 integrity", () => {
    expect(TypeList.ARRAY_OF_UINT8.size).toBe(1);
    expect((TypeList.ARRAY_OF_UINT8 as any)._signed).toBe(false);
    expect(TypeList.ARRAY_OF_UINT8 instanceof IntArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_UINT8)).toBe(true);
});

test("ARRAY_OF_INT16 integrity", () => {
    expect(TypeList.ARRAY_OF_INT16.size).toBe(2);
    expect((TypeList.ARRAY_OF_INT16 as any)._signed).toBe(true);
    expect(TypeList.ARRAY_OF_INT16 instanceof IntArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_INT16)).toBe(true);
});

test("ARRAY_OF_UINT16 integrity", () => {
    expect(TypeList.ARRAY_OF_UINT16.size).toBe(2);
    expect((TypeList.ARRAY_OF_UINT16 as any)._signed).toBe(false);
    expect(TypeList.ARRAY_OF_UINT16 instanceof IntArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_UINT16)).toBe(true);
});

test("ARRAY_OF_INT32 integrity", () => {
    expect(TypeList.ARRAY_OF_INT32.size).toBe(4);
    expect((TypeList.ARRAY_OF_INT32 as any)._signed).toBe(true);
    expect(TypeList.ARRAY_OF_INT32 instanceof IntArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_INT32)).toBe(true);
});

test("ARRAY_OF_UINT32 integrity", () => {
    expect(TypeList.ARRAY_OF_UINT32.size).toBe(4);
    expect((TypeList.ARRAY_OF_UINT32 as any)._signed).toBe(false);
    expect(TypeList.ARRAY_OF_UINT32 instanceof IntArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_UINT32)).toBe(true);
});

test("ARRAY_OF_INT64 integrity", () => {
    expect(TypeList.ARRAY_OF_INT64.size).toBe(8);
    expect((TypeList.ARRAY_OF_INT64 as any)._signed).toBe(true);
    expect(TypeList.ARRAY_OF_INT64 instanceof IntArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_INT64)).toBe(true);
});

test("ARRAY_OF_UINT64 integrity", () => {
    expect(TypeList.ARRAY_OF_UINT64.size).toBe(8);
    expect((TypeList.ARRAY_OF_UINT64 as any)._signed).toBe(false);
    expect(TypeList.ARRAY_OF_UINT64 instanceof IntArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_UINT64)).toBe(true);
});

test("ARRAY_OF_FLOAT integrity", () => {
    expect(TypeList.ARRAY_OF_FLOAT.size).toBe(4);
    expect(TypeList.ARRAY_OF_FLOAT instanceof FloatArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_FLOAT)).toBe(true);
});

test("ARRAY_OF_DOUBLE integrity", () => {
    expect(TypeList.ARRAY_OF_DOUBLE.size).toBe(8);
    expect(TypeList.ARRAY_OF_DOUBLE instanceof FloatArrDataType).toBe(true);
    expect(Object.isFrozen(TypeList.ARRAY_OF_DOUBLE)).toBe(true);
});
