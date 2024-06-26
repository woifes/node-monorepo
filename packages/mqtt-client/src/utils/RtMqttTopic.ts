// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as rt from "runtypes";

/**
 * A runtype which validates a mqtt topic.
 */
export const RtMqttTopic = rt.Array(rt.String).withConstraint((parts) => {
    if (parts.length === 0) {
        return false;
    }
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.length === 0) {
            return false;
        }
        if (part.indexOf("+") !== -1 && part.length !== 1) {
            return false;
        }
        if (
            part.indexOf("#") !== -1 &&
            (part.length !== 1 || i !== parts.length - 1)
        ) {
            return false;
        }
    }
    return true;
});
