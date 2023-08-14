# @woifes/yasdi-mqtt

## Why?
This project sends the data fetched from the [node-yasdi](../../packages/node-yasdi/) project and sends it to a MQTT broker.

**Please check the source code before using this package**

## Installation
Package not (yet) published

## Quick start
```typescript
const CONFIG = {
    name: "client01",
    mqtt: {
        url: "localhost",
        clientId: "client01",
    },
    yasdi: {
        sendIntervalS: 5,
        mqttPrefix: "tags",
        plants: [
            {
                name: "plant01",
                alias: "roof01",
                inverter: [
                    {
                        id: "inv01",
                        serialNumber: 123456,
                    },
                    {
                        id: "inv02",
                        serialNumber: 789,
                    },
                ],
            },
        ],
    },
}

const YASDI_MQTT = new YasdiMqtt(CONFIG, "path/to/tmp/dir", "/dev/ttyUSB0");
```
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
