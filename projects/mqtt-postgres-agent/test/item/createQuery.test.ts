// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { createQuery } from "../../src/item/createQuery";

it("should create the query", () => {
    const testMap = new Map<string, string>();
    testMap.set("keyA", "valueA");
    testMap.set("keyB", "valueB");
    testMap.set("keyC", "valueC");

    expect(createQuery("myTable", testMap)).toEqual([
        "INSERT INTO myTable(keyA, keyB, keyC) VALUES($1, $2, $3);",
        ["valueA", "valueB", "valueC"],
    ]);
});
