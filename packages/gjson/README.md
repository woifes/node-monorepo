# @woifes/gjson

## Why?
This package implements the (GSJON)[https://github.com/tidwall/gjson] json document search. Since the NodeJS environments already has a good json support this package focuses on the search aspect of GJSON (Check the supported features section for details).

## Installation
Package not (yet) published

## Quick start

```typescript
import { get } from "@woifes/gjson";

const exampleJson = {
    name: { first: "Tom", last: "Anderson" },
    age: 37,
    children: ["Sara", "Alex", "Jack"],
    "fav.movie": "Deer Hunter",
    friends: [
        { first: "Dale", last: "Murphy", age: 44, nets: ["ig", "fb", "tw"] },
        { first: "Roger", last: "Craig", age: 68, nets: ["fb", "tw"] },
        { first: "Jane", last: "Murphy", age: 47, nets: ["ig", "tw"] },
    ],
};

console.log( get(exampleJson, "name.first") ); //"Tom"
```

## Supported GJSON features

|GSJON feature|Supported?|Notes|
|---|---|---|
|[Path Structure](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#path-structure)|YES||
|[Basic](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#basic)|YES||
|[Wildcards](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#wildcards)|YES||
|[Escape Character](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#escape-character)|YES||
|[Arrays](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#arrays)|YES||
|[Queries](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#queries)|YES||
|[Dot vs Pipe](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#dot-vs-pipe)|YES||
|[Modifiers](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#modifiers)|NO||
|[Modifier arguments](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#modifiers)|NO||
|[Custom modifiers](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#custom-modifiers)|NO||
|[Multipaths](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#multipaths)|NO||
|[Literals](https://github.com/tidwall/gjson/blob/master/SYNTAX.md#literals)|NO||
|[JSON Lines](https://github.com/tidwall/gjson#json-lines)|NO||

> This table is taken from the docs of [gjson-py](https://github.com/volans-/gjson-py)

## Running the build

The project is part of a monorepo. If the project is checked out in this environment use the following scripts:

TypeScript build:

```shell
pnpm run compile
```

Run tests:

```shell
pnpm test
```