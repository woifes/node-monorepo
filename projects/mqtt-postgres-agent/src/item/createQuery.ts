// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

export function createQuery(
    table: string,
    keyValues: Map<string, string>,
    timeStamps: Map<string, string>,
): [string, string[]] {
    //INSERT INTO battery(voltage, state_of_charge, client_time, mac) VALUES($1, $2, $3, $4);
    const keys = Array.from(keyValues.keys());
    const timestampKeys = Array.from(timeStamps.keys());
    const allKeys = [...keys, ...timestampKeys];
    const values: string[] = [
        ...Array.from(keyValues.values()),
        ...Array.from(timeStamps.values()),
    ];

    const query = `INSERT INTO ${table}(${allKeys.join(
        ", ",
    )}) VALUES(${createReplacer(keys, timestampKeys).join(", ")});`;
    return [query, values];
}

function createReplacer(keys: string[], timestampKeys: string[]): string[] {
    const replacer = [];
    let i = 0;
    for (const _key in keys) {
        replacer.push(`$${i + 1}`);
        i++;
    }
    for (const _timestampKey in timestampKeys) {
        replacer.push(`to_timestamp($${i + 1})`);
        i++;
    }
    return replacer;
}
