// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { S7AddressString } from "../../src/types/S7AddressString";

it("should validate correct string", () => {
    expect(() => {
        S7AddressString.check("DB1,X1.2.3");
    }).not.toThrow();
    expect(() => {
        S7AddressString.check("MX1.2.3");
    }).not.toThrow();
    expect(() => {
        S7AddressString.check("MX1.2");
    }).not.toThrow();
});
