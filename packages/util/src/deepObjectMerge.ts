// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import deepmerge from "deepmerge";

const combineMerge = (target: any, source: any, options: any) => {
    const destination = target.slice();

    source.forEach((item: any, index: any) => {
        if (typeof destination[index] === "undefined") {
            destination[index] = options.cloneUnlessOtherwiseSpecified(
                item,
                options,
            );
        } else if (options.isMergeableObject(item) as boolean) {
            destination[index] = deepmerge(target[index], item, options);
        } else {
            destination[index] = item;
        }
    });
    return destination;
};

/**
 * Does a deep merge of the given object (returns new object the existing ones will not be modified)
 * Objects in array will be merged too. Elementary datatypes will be replaced
 * @param o1 object 1
 * @param o2 object 2
 * @returns
 */
export function deepObjectMerge(o1: any, o2: any) {
    return deepmerge(o1, o2, { arrayMerge: combineMerge });
}
