# @woifes/alarmhandler

## Why?
This packages is an enhancement of the [alarmhandler]("../alarmhandler/) package. It adds a mqtt interface and on top of that an command interface to interact with an [alarmhandler]("../alarmhandler/). Since this is an implementation detail this more of an internal package.

## Installation
Package not published

## Quick start

```typescript
    let alarmHandler = new AlarmHandler("myAlarmHandler", {
        numOfAlarms: 3,
        traceFilePath: "path/to/tracefile",
        presentAlarmsFilePath: "path/to/presentalarmfile",
        alarmDefsPath: "path/to/alarmdefinitions",
    });
    alarmHandler.updateSignal(1, true) //alarm occurred
    alarmHandler.updateSignal(1, true) //alarm gone
    alarmHandler.acknowledgeAlarm(1) //acknowledge the alarm
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
## Roadmap
* Get History?
* Help text for text command
* Sending of broadcast present alarms?