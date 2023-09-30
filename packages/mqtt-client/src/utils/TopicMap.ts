// SPDX-FileCopyrightText: © 2022 woifes <https://github.com/woifes>
// SPDX-License-Identifier: AGPL-3.0-or-later

//Message Cache
// * insert without wildcards
// * filter with wildcards
//Subscriber List
// * insert with wildcards
// * filter without wildcards

/**
 * This object holds a nested map of items for mqtt topics
 * @param wildCardsOnInsert selects if the map shall allow the wildcard characters '+', '#' for inserting
 * @param isRoot indicates if the map is the root of the whole map
 * Message Cache
 * - insert without wildcards
 * - filter with wildcards
 * Subscriber List
 * - insert with wildcards
 * - filter without wildcards
 */
export class TopicMap<T> {
    private _value?: T;
    private _sublevels: Map<string, TopicMap<T>> = new Map();
    constructor(private wildCardsOnInsert: boolean, private isRoot = true) {}

    get isEmpty(): boolean {
        return this._value === undefined && this._sublevels.size === 0;
    }

    /**
     * Returns the next level of the given topic
     * @param topic the topic for which the level shall went down (splices the array!)
     * @returns
     */
    private getNextLevel(topic: string[]): TopicMap<T> | undefined {
        const next = topic.splice(0, 1)[0];
        return this._sublevels.get(next);
    }

    /**
     * Validates the given topic for inserting into the map. Takes into account whether wildcards are allowed and if the map is at the root.
     * @param topic the topic to check
     * @returns true or false depending on the outcome
     */
    private validateInsertTopic(topic: string[]): boolean {
        if (this.isRoot) {
            //do not allow an empty topic
            if (topic.length === 0) {
                return false;
            }

            if (!this.wildCardsOnInsert) {
                return !topic.includes("+") && !topic.includes("#");
            } else {
                const indexOfHash = topic.indexOf("#");
                if (indexOfHash !== -1 && indexOfHash !== topic.length - 1) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Validates the given topic for searching in the map. If the map allows wildcards on inserting they are not allowed on searching
     * @param topic the topic to check
     * @returns true or false depending on the outcome
     */
    private validateSearchTopic(topic: string[]): boolean {
        if (this.isRoot) {
            if (topic.length === 0) {
                return false;
            }

            if (this.wildCardsOnInsert) {
                return !topic.includes("+") && !topic.includes("#");
            } else {
                const indexOfHash = topic.indexOf("#");
                if (indexOfHash !== -1 && indexOfHash !== topic.length - 1) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Inserts a value into the map
     * @param topic the topic for the nesting
     * @param value the value to insert
     */
    setValue(topic: string[], value: T) {
        topic = [...topic];
        if (!this.validateInsertTopic(topic)) {
            return;
        }
        if (topic.length === 0) {
            this._value = value;
        } else {
            const nextLevelKey = topic[0];
            let next = this.getNextLevel(topic);
            if (next === undefined) {
                next = new TopicMap(this.wildCardsOnInsert, false);
                this._sublevels.set(nextLevelKey, next);
            }
            next.setValue(topic, value);
        }
    }

    /**
     * Returns the value for the given topic
     * @param topic the topic to search for
     * @returns the value or undefined if the value is not found or the topic is incorrect
     */
    getValue(topic: string[]): T | undefined {
        topic = [...topic];
        if (!this.validateInsertTopic(topic)) {
            return undefined;
        }
        if (topic.length === 0) {
            return this._value;
        } else {
            const next = this.getNextLevel(topic);
            if (next !== undefined) {
                return next.getValue(topic);
            } else {
                return undefined;
            }
        }
    }

    /**
     * Deletes the value for the given topic
     * @param topic the topic to search for
     */
    deleteValue(topic: string[]) {
        topic = [...topic];
        if (!this.validateInsertTopic(topic)) {
            return;
        }
        if (topic.length === 0) {
            delete this._value;
        } else {
            const nextLevelKey = topic[0];
            const next = this.getNextLevel(topic);
            if (next !== undefined) {
                next.deleteValue(topic);
                if (next.isEmpty) {
                    this._sublevels.delete(nextLevelKey);
                }
            }
        }
    }

    /**
     * Deletes all values which pass a given filter check
     * @param filter the filter function to test all values
     */
    deleteByFiler(filter: (arg0: T) => boolean) {
        if (this._value !== undefined && filter(this._value)) {
            delete this._value;
        }
        for (const [key, next] of this._sublevels) {
            next.deleteByFiler(filter);
            if (next.isEmpty) {
                this._sublevels.delete(key);
            }
        }
    }

    /**
     * Generator for all values which match to the given topic
     * @param topic the topic to match with
     */
    *findValues(topic: string[]): Generator<T> {
        topic = [...topic];
        if (!this.validateSearchTopic(topic)) {
            return;
        }
        if (topic.length === 0) {
            if (!this.isRoot && this._value !== undefined) {
                yield this._value;
                return;
            }
        } else {
            const nextLevelKey = topic[0];
            if (nextLevelKey === "#") {
                for (const next of this._sublevels.values()) {
                    yield* next.allValues();
                }
            } else if (nextLevelKey === "+") {
                topic.splice(0, 1);
                for (const next of this._sublevels.values()) {
                    yield* next.findValues(topic);
                }
            } else {
                let next = this.getNextLevel(topic);
                if (next !== undefined) {
                    yield* next.findValues(topic);
                }

                //+ wildcard on this level
                next = this._sublevels.get("+");
                if (next !== undefined) {
                    yield* next.findValues(topic);
                }
                //# on this level (insertion topic validation ensures that there are no more following levels)
                next = this._sublevels.get("#");
                if (next !== undefined) {
                    yield* next.findValues([]);
                }
            }
        }
    }

    /**
     * Generator function which returns all values inside the map
     */
    *allValues(): Generator<T> {
        if (!this.isRoot && this._value !== undefined) {
            yield this._value;
        }
        if (this._sublevels !== undefined) {
            for (const value of this._sublevels.values()) {
                yield* value.allValues();
            }
        }
    }

    /**
     * Generates a javascript object of the current map
     * @param valueKey the key which is used for the value of corresponding level (to distinguish with a sublevel)
     * @param valueTransform a function which modifies every value which is found
     * @returns a nested object which represents the topic map
     */
    generateObject(
        valueKey = "",
        valueTransform: (value: T) => any = (v) => v,
    ) {
        const getValue = () => {
            return valueTransform(this._value!);
        };
        if (this._value !== undefined && this._sublevels.size === 0) {
            return getValue();
        }

        const obj: any = {};
        if (this._value !== undefined) {
            obj[valueKey] = getValue();
        }
        for (const [key, sublevel] of this._sublevels) {
            obj[key] = sublevel.generateObject(valueKey, valueTransform);
        }
        return obj;
    }

    toJSON() {
        return this.generateObject();
    }
}
