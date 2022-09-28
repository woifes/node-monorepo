# @woifes/util

## Why?
Set of utility functions, types or classes which do not have a package (yet)

## Installation
Package not (yet) published

## Quick start

* `CheckItemUniqueness`
Checks if the items in an array are unique. It is possible to specify a callback function which is called on every item to generate a value for comparison

```typescript
    CheckItemUniqueness([1, 2, 3]) //true
```

* `CsvFileHandler`
A simple helper class for handling csv files

```typescript
    let csvFileHandler = new CsvFileHandler("mylog", "/mydir", { maxFileSizeMB: 5 });
    csvFileHandler.writeLine("item1", "item2"); //true
```

* `DeepObjectMerge`
A helper function which merges two objects. Added a array merge function to the [deepmerge](https://www.npmjs.com/package/deepmerge) module

```typescript
    const o1 = { a: 1, b: 2 };
    const o2 = { a: 10, c: -3 };
    deepObjectMerge(o1, o2); // { a: 10, b: 2, c: -3 }
```

* `PersistentRuntype`
Holds an object persistant on disc via a json file

```typescript
const testRuntype = rt.Record({ a: rt.Array(rt.String), b: rt.Number, c: rt.String });
const defaultValue = { a: ["A", "B", "C"], b: 123, c: "Hello" };
const pr = new PersistantRuntype("<path to file>", testRuntype, defaultValue);

pr.setValue({ a: ["a", "b", "c"], b: 456, c: "World" });

pr.getValue(); //{ a: ["a", "b", "c"], b: 456, c: "World" }
```

* `PickRequire` type
```typescript
    type myType = { A?: number, B: string };
    type myTypeWithARequired = PickRequire<myType, "A">
    let a: myType = { B: "abc" } //ok
    let b: myTypeWithARequired = { B: "abc" } //not ok
```

## Running the build

The project is part of a monorepo. If the project is checked out in this environment use the following scripts:

TypeScript build:

```shell
npm run compile
```

Run tests:

```shell
npm test
```