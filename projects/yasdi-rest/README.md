# @woifes/yasdi-rest

## Why?

This project add a REST api over the [node-yasdi](../../packages//node-yasdi/)
package. It starts the yasdi library to connect to a RS485 bus of SMA inverter.
Then it wraps a REST API around the yasdi library functions (readonly).

**Please check the source code before using this package**

## Installation

Package not (yet) published

## Quick start

Check [index.ts](./index.ts). There are a view ENV variables for configuration:

- `YASDI_REST_ID` This is used for creation of the ini file
- `YASDI_REST_DEVICE_COUNT` How many devices are expected
- `YASDI_REST_PORT` The port to host the REST API
- `YASDI_REST_SERIAL_DEVICE` The serial device to use for the RS485
  communication
- `YASDI_REST_INI_TMP_DIR` The directory where the ini file for node-yasdi is
  created
- `YASDI_REST_DEBUG` Activates the debug logging of the yasdi library Paths:
  - `/` - Returns a simple status info object
  - `/serials` - Returns an array of serial number from the found devices (only
    when device search is finished)
  - `/device/:serial/values` - Returns the spot values of the device with the
    given serial
  - `/device/:serial/data` - Returns metadata for the given device serial
  - `/values` - Returns a dictionary where the keys are the device serials and
    the values are a set of inverter values (use this when you have more than 4
    devices) Docker compose example:
  - `/reset` - Triggers a reset of the yasdi library (device search will be
    repeated)

```yaml
version: '3.8'
services:
  yasdi:
    image: yasdi-rest:0.1.0
    volumes:
      - ./dev/ttyUSB0:/dev/ttyUSB0
    ports:
      - 3001:3001
    privileged: true
    environment:
      - "YASDI_REST_ID=YasdiRest"
      - "YASDI_REST_DEVICE_COUNT=2"
      - "YASDI_REST_PORT=3001"
    restart: always
```

## Running the build

The project is part of a monorepo. If the project is checked out in this
environment use the following scripts:

TypeScript build:

```shell
pnpm run compile
```

Run tests:

```shell
pnpm test
```

Docker build:

```shell
pnpm docker:build
```
