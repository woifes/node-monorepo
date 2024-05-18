// SPDX-FileCopyrightText: © 2024 woifes <https://github.com/woifes>
// SPDX-License-Identifier: MIT

/**
 * Splits a MQTT topic in a way that certain multilevel variants can be handled.
 * Handles every level as an array. If one level has multiple variants the array at this position has more items.
 * @param topicString the topic string to split
 * @returns array of arrays with the variants at each level
 */
function splitTopicString(topicString: string): string[][] {
    const topicLevels = topicString.split("/");
    const multiLevels: string[][] = [];
    for (const topicLevel of topicLevels) {
        if (topicLevel === "+") {
            multiLevels.push([topicLevel]);
            continue;
        }
        multiLevels.push(topicLevel.split("+"));
    }
    return multiLevels;
}

/**
 * Enlarges the list of MQTT topic combinations for the next level.
 * @param currentResult the current state of the up to now found topic variants
 * @param nextLevel the next level of the MQTT topic to handle
 * @returns array of string for the next topic combinations
 */
function handleNextLevel(
    currentResult: string[],
    nextLevel: string[],
): string[] {
    const nextResult: string[] = [];
    for (const level of nextLevel) {
        for (const currentItem of currentResult) {
            if (currentItem.length === 0) {
                nextResult.push(level);
                continue;
            }
            nextResult.push(`${currentItem}/${level}`);
        }
    }
    return nextResult;
}

/**
 * Generates a set of topic variants out of the MQTT topic with topic variants.
 * @param topicString the topic string to handle
 * @returns array of string with all combinations of topic variants
 */
export function generateTopicVariants(topicString: string): string[] {
    let variants = [""];

    const topicMultiLevels = splitTopicString(topicString);

    for (const level of topicMultiLevels) {
        variants = handleNextLevel(variants, level);
    }
    return variants;
}
