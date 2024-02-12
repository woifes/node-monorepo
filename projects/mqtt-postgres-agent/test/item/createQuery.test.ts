// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { createQuery } from "../../src/item/createQuery";

it("should create the query", () => {
    const testMap = new Map<string, string>();
    testMap.set("keyA", "valueA");
    testMap.set("keyB", "valueB");
    testMap.set("keyC", "valueC");
    const testTimestampMap = new Map<string, string>();
    testTimestampMap.set("keyD", "123");
    testTimestampMap.set("keyE", "456");

    expect(createQuery("myTable", testMap, testTimestampMap)).toEqual([
        "INSERT INTO myTable(keyA, keyB, keyC, keyD, keyE) VALUES($1, $2, $3, to_timestamp($4), to_timestamp($5));",
        ["valueA", "valueB", "valueC", "123", "456"],
    ]);
});
