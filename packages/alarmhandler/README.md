# @woife/binarytypes

## Why?
The idea of this package is to have a alarm representation like is commoly used in automation. This means to have a set of signal which indicate the presence of a certain alarm event. 
In the same way the alarms can be acknowledged. The implementation was aimed to be as small as possible. The peristance is aimed to be minimal but also to be human readable (no sqlite).

## Installation
Package not (yet) published

## Quick start

```typescript
    let alarmHandler = new AlarmHandler("myAlarmHandler", {
        numOfAlarms: 3,
        traceFilePath: "path/to/tracefile",
        presentAlarmsFilePath: "path/to/presentalarmfile",
        alarmDefsPath: "path/to/alarmdefinitions",
    });
    alarmHandler.updateSignal(1, true) //alarm occured
    alarmHandler.updateSignal(1, true) //alarm gone
    alarmHandler.acknowledgeAlarm(1) //acknowledge the alarm
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