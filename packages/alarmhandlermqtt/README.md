# @woifes/alarmhandlermqtt

## Why?
This packages is an enhancement of the [alarmhandler]("../alarmhandler/) package. It adds a mqtt interface and on top of that an command interface to interact with an [alarmhandler]("../alarmhandler/). Since this is an implementation detail this more of an internal package.

## Installation
Package not published

## Quick start

```typescript
    const alarmHandler = new AlarmHandlerMqtt("myAlarmHandler", {
        numOfAlarms: 3,
        traceFilePath: "path/to/tracefile",
        presentAlarmsFilePath: "path/to/presentalarmfile",
        alarmDefsPath: "path/to/alarmdefinitions",
        additionalNewAlarmTopics: [
            "topic01/newAlarms", //send alarms which are triggered to additional topics (in textual format)
            "topic02/newAlarms"
        ]
        presentAlarmWatchdogS: 3, //default 3s - max duration between the present alarm info (is triggered automatically after this time)
        textCommand: {
            commandTopicPrefix: "messenger/from",
            commandResponseTopicPrefix: "messenger/to"
        }
    });
```

## Used MQTT topics:
### Commands
* `alarms/ack/<mqttClientId>`: Send a UINT32 to this topic in order to (try) to acknowledge the sent alarm number (send 0 in order to ack all) - no response
* `cmd/<mqttClientId>/<requesterClientId>/setAlarmText`: Requests to change the alarm text of an alarm expects a JSON array in the form `[<commandId>, <alarmNumber>, <newAlarmText"]` sends a response to `cmdRes/<requesterId>/<mqttClientId>/setAlarmText` with a JSON array in the form `[<commandId>, <0/1>]` (1 success and 0 failure)
* `cmd/<mqttClientId>/<requesterClientId>/getHistory`: Requests the alarm history expects a JSON array in the form `[<commandId>, <UNIX timestamp "from">, <UNIX timestamp "to">]` sends a response to `cmdRes/<requesterId>/<mqttClientId>/getHistory` with a JSON array in the form `[<commandId>, <0/1>, [...<log file entries>]]` (1 success and 0 failure)
### Information
* `alarms/sources/<mqttClientId>/numberOfAlarms`: Sends the total number of alarms of this alarm handler
* `alarms/present/<mqttClientId>`: Sends the present alarm information to this topic
* `alarms/new/<mqttClientId>`: Sends the alarm info (JSON) of a new triggered alarm to this topic (see also `additionalNewAlarmTopics`)
### Text command api
* `<commandTopicPrefix>/<requesterId>`: Provides an interface similar to a command line. The idea is that one can send the command to a topic and receives the result on a second topic. The second topic is `<commandResponseTopicPrefix>/<requesterId>`. The command starts with a string `!al` targeting all alarm handler which are subscribed on the given topic
#### Text commands
* `!al -h` prints help
* `!al who` prints alarm handler name(id) and their number of alarms
* `!al ack <alarmHandlerId> [alarmIdToAck]` sends acknowledge if `alarmIdToAck` is "0" or omitted ack all alarms
* `!al act [alarmHandlerId]` request present alarm information if `alarmHandlerId` is omitted every alarm handler will print its present alarms

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
## Roadmap
* Get History?
* Help text for text command
* Sending of broadcast present alarms?