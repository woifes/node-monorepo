// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

/**
 * Sets certain keys of the given type to be required
 */
export type PickRequire<T, K extends keyof T> = {
    [U in keyof (Required<Pick<T, K>> & Omit<T, K>)]: (Required<Pick<T, K>> &
        Omit<T, K>)[U];
};
