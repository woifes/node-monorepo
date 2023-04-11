// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

import { checkTopic } from "../../src/utils/checkTopic";

test("CheckTopic test", () => {
    //yes
    expect(
        checkTopic(["test", "topic", "check"], ["test", "topic", "check"]),
    ).toBe(true);

    expect(checkTopic(["test", "topic", "check"], ["test", "+", "check"])).toBe(
        true,
    );

    expect(checkTopic(["test", "topic", "check"], ["test", "#"])).toBe(true);

    expect(checkTopic(["test", "topic", "check"], ["test", "topic", "#"])).toBe(
        true,
    );

    //no
    expect(
        checkTopic(["test", "topic", "check"], ["test", "nottopic", "check"]),
    ).toBe(false);

    expect(checkTopic(["test", "topic", "check"], ["test", "topic"])).toBe(
        false,
    );

    expect(checkTopic(["test", "topic"], ["test", "topic", "check"])).toBe(
        false,
    );
});
