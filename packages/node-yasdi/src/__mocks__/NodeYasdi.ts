// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import { EventEmitter } from "events";

export class NodeYasdi extends EventEmitter {
    constructor() {
        super();
    }

    get deviceSearchFinished(): boolean {
        return true;
    }
}
