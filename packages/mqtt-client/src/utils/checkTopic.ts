// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Checks if the topic is matching for the given subscribe
 * @param topic The topic to check
 * @param subscribe The subscribe the client has made
 */
export const checkTopic = function (
    topic: string[],
    subscribe: string[]
): boolean {
    if (topic.length < subscribe.length) {
        return false;
    }
    if (
        topic.length > subscribe.length &&
        subscribe[subscribe.length - 1] != "#"
    ) {
        return false;
    }
    for (let i = 0; i < topic.length; i++) {
        const t = topic[i];
        const s = subscribe[i];
        if (t == s || s == "+") {
            //ok go on
        } else if (s == "#") {
            return true;
        } else {
            return false;
        }
    }
    return true;
};
