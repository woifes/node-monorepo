// SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

export function createQuery(
    table: string,
    keyValues: Map<string, string>,
): [string, string[]] {
    //INSERT INTO battery(voltage, state_of_charge, client_time, mac) VALUES($1, $2, $3, $4);
    const keys: string[] = [];
    const values: string[] = [];
    for (const [key, value] of keyValues.entries()) {
        keys.push(key);
        values.push(value);
    }
    const query = `INSERT INTO ${table}(${keys.join(
        ", ",
    )}) VALUES(${createReplacer(values).join(", ")});`;
    return [query, values];
}

function createReplacer(keys: any[]): string[] {
    const replacer = [];
    for (let i = 0; i < keys.length; i++) {
        replacer.push(`$${i + 1}`);
    }
    return replacer;
}
