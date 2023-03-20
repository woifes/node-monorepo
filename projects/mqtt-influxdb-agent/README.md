# @woifes/mqtt-influxdb-agent

## Why?
This project acts as a agent for InfluxDB V2.x. Unfortunately the MQTT plugin of [Telegraf](https://www.influxdata.com/time-series-platform/telegraf/) was not suitable for me so I decided to do it myself. The main difference is that the topics can be configured individually. For the [payload parsing](https://www.influxdata.com/blog/mqtt-topic-payload-parsing-telegraf/) (as it is called in telegraf) I use a string array, where the strings acts as the key in the search chain. As soon as there is a good package for the [GJSON](https://gjson.dev/) syntax in the NodeJS universe I will add it.

**Please check the source code before using this package**

## Installation
Package not (yet) published

## Quick start
```typescript
const CONFIG = {
    mqtt: {
        url: "localhost",
        clientId: "client01",
        auth: {
            username: "myUser",
            password: "123456",
        },
    },
    influx: {
        url: "http://localhost",
        token: "token123",
        organization: "myOrg",
    },
    items: [
        {
            topic: "A/+/C/+",
            bucket: "myBucket",
            measurement: "myMeasurement",
            datatype: "int",
            valueName: "myValueName",
            precision: "s",
            topicTags: "_/tag01/_/tag02",
            qos: 0,
            minTimeDiffMS: 100,
            searchPath: ["my", "path"],
        },
        {
            topic: "E/F/G/H",
            bucket: "myBucket02",
            measurement: "myMeasurement02",
        },
    ],
};

const AGENT = new MqttInfluxDbAgent(CONFIG);
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
