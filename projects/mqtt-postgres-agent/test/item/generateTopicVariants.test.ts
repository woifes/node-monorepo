// SPDX-FileCopyrightText: © 2024 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

import { generateTopicVariants } from "../../src/item/generateTopicVariants";

it("should handle different variants of variants", () => {
    const topic1 = "pv/plant1+plant2/power";
    const topic2 = "pv+other/plant/power";
    const topic3 = "pv/plant/power";
    const topic4 = "pv/+/power";

    expect(generateTopicVariants(topic1)).toEqual([
        "pv/plant1/power",
        "pv/plant2/power",
    ]);
    expect(generateTopicVariants(topic2)).toEqual([
        "pv/plant/power",
        "other/plant/power",
    ]);
    expect(generateTopicVariants(topic3)).toEqual(["pv/plant/power"]);
    expect(generateTopicVariants(topic4)).toEqual(["pv/+/power"]);
});
