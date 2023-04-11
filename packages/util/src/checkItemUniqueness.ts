// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

/**
 * Checks if the items in a given array are unique
 * @param array the array to test
 * @param compare a function which extracts a value from one item to use for the comparison
 * @returns true if the items are unique, false if not
 */
export function checkItemUniqueness<T>(array: T[], compare?: (item: T) => any) {
    compare =
        compare ||
        function (item: T): any {
            return item;
        };
    const shelf = new Map<any, boolean>();
    for (let i = 0; i < array.length; i++) {
        const sample = compare(array[i]);
        if (shelf.get(sample) !== undefined) {
            return false;
        } else {
            shelf.set(sample, true);
        }
    }
    return true;
}
