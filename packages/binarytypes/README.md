# @woife/binarytypes

# Why?
The idea of this package is to have a common way of handling binary datatypes in NodeJS. The main use case was for a package which reads and writes data to S7 PLCs. Please check the source code before using the package.

# Installation
Package not (yet) published

# Quick start

The module supports the following datatypes:
|Specifier|Description|
|-|-|
|INT8|8 Bit signed integer|
|UINT8|8 Bit unsigned integer|
|INT16|16 Bit signed integer|
|UINT16|16 Bit unsigned integer|
|INT32|32 Bit signed integer|
|UINT32|32 Bit unsigned integer|
|INT64|64 Bit signed integer|
|UINT64|64 Bit unsigned integer|
|FLOAT|32 Bit floating point number|
|DOUBLE|64 Bit floating point nuzmber|
|ARRAY_OF_INT8|Array version of the corresponding type|
|ARRAY_OF_UINT8|Array version of the corresponding type|
|ARRAY_OF_INT16|Array version of the corresponding type|
|ARRAY_OF_UINT16|Array version of the corresponding type|
|ARRAY_OF_INT32|Array version of the corresponding type|
|ARRAY_OF_UINT32|Array version of the corresponding type|
|ARRAY_OF_INT64|Array version of the corresponding type|
|ARRAY_OF_UINT64|Array version of the corresponding type|
|ARRAY_OF_FLOAT|Array version of the corresponding type|
|ARRAY_OF_DOUBLE|Array version of the corresponding type|

```javascript
import { DataTypes } from "@woife/binarytypes"

DataTypes["UINT8"].check(255) //255
DataTypes["UINT8"].check(256) //throws

DataTypes["UINT8"].validate(255) //true
DataTypes["UINT8"].validate(256) //false

DataTypes["UINT16"].toBuffer(255, true) //<Buffer ff 00> little endian
DataTypes["UINT16"].toBuffer(255) //<Buffer 00 ff> big endian
DataTypes["UINT8"].toBuffer(256, true) //<Buffer 00 00> - Error

DataTypes["UINT16"].fromBuffer(Buffer.from("ff00", "hex"), true) //255 little endian
DataTypes["UINT16"].fromBuffer(Buffer.from("00ff", "hex")) //255 big endian
DataTypes["UINT16"].fromBuffer(Buffer.alloc(3), true) //throws

DataTypes["UINT8"].toString(255) //"255"
DataTypes["UINT8"].toString(256) //throws

DataTypes["UINT16"].fromString("255") //255
DataTypes["UINT16"].fromString("256") //throws

```
## Transformation from `check` function

The `check` function does not simply return the original value, it transforms it to the javascrip equivalent. This means for every datatype (except `INT64` and `UINT64`) it returns `number` (or an array of `number`) for the 64 bit integers it returns `bigint` (array)

## Runtypes

The module also supports [Runtypes](https://www.npmjs.com/package/runtypes). These are prefixed with "rt" e. q. `rtUINT8`

## Helper functions

Additionally there are some functions for the calculation of the size of integers and array of integers

```javascript
normalizeBigInt("123") //123n 
calcIntegerSize(255) //1
checkIntSize(255) //1
calcTypeOfArray([255, -255]) //"ARRAY_OF_INT16"
```

# Running the build

The project is part of a monorepo. If the project is checked out in this environment use the following scripts:

TypeScript build:

```shell
npm run compile
```

Run tests:

```shell
npm test
```