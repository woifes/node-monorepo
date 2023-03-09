# @woifes/matrix-mqtt-bridge

## Why?
This is a simple Matrix-MQTT [Bridgebot-based bridge](https://matrix.org/blog/2017/03/11/how-do-i-bridge-thee-let-me-count-the-ways#bridgebot-based-bridges). The idea is to have a set of Matrix rooms where messages are transferred from and to a MQTT message. Only simple text messages are used and also the sender are not important. The main goal is to have a set of alerting rooms to which users can join to receive certain events. This alerts are sent via MQTT messages. The transfer from messages from the matrix rooms to MQTT messages can be used for controlling (for example acknowledging alarms).

**Please check the source code before using this package**

## Installation
Package not (yet) published

## Quick start
There is a pair of MQTT topics: `<mqttTopicPrefix>/rooms/<roomId>/to` to send a message (MQTT->Matrix) and `<mqttTopicPrefix>/rooms/<roomId>/from` where messages from any user in the room (except the bridge itself) are published (Matrix->MQTT). `roomId` in sense of this bridge is used for the room name on the Matrix homeserver as well as the local alias prefix (`#<roomId>:<homeserverurl>`).

Additionally a list (array) of roomIds is send to `<mqttTopicPrefix/rooms`.

### Usage

```typescript

import { MatrixMqttBridge } from "../src/MatrixMqttBridge";

const CONFIG = {
    mqtt: {
        url: "localhost",
        clientId: "client01",
    },

    matrix: {
        url: "<homeserverurl>",
        userName: "user01",
        accessToken: "abc",
    },

    bridge: {
        rooms: [
            { 
                roomId: "room01", 
                federate: false //Optional - default false
                public: true //Optional - default true
            },
        ],
    },
}

const BRIDGE = new MatrixMqttBridge(CONFIG);
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
