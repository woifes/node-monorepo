# @woifes/yasdi-rest

## Why?
This project add a REST api over the [node-yasdi](../../packages//node-yasdi/) package.

**Please check the source code before using this package**

## Installation
Package not (yet) published

## Quick start
Check [index.ts](./index.ts). There are a view ENV variables for configuration:
* ```ID``` This is used for creation of the ini file
* ```DEVICE_COUNT``` How many devices are expected
* ```PORT``` The port to host the REST API
* ```SERIAL_DEVICE``` The serial device to use for the RS485 communication
* ```TMP_DIR``` The directory where the ini file for node-yasdi is created

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
