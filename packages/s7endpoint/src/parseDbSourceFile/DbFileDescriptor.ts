// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: UNLICENSED

import * as rt from "runtypes";

/**
 * Runtype for a minimal data block source file descriptor
 */
export const DBFileDescriptor = rt.Record({
    dbNr: rt.Number.withConstraint((n) => n > 0),
    filePath: rt.String.withConstraint((s) => s.length > 0),
});

/**
 * Type for the corresponding runtype
 */
export type tDBFileDescriptor = rt.Static<typeof DBFileDescriptor>;
