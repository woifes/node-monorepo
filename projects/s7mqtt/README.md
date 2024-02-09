# @woifes/s7mqtt

## Why?
This project acts as a gateway between MQTT and the a device via the S7 protocol (RFC1006). The goal is to have as less as possible overhead for the communication on the S7 device.

> I have only used the package with S7 1200 PLCs and the LOGO! logic controller

**Please check the source code before using this package**

## Installation
Package not (yet) published

## Quick start
You can use a remote endpoint for the communication (e. g. Plc or LOGO!) or a local endpoint (so that for example a WinCC Panel can connect to it).
The following communication variants can be configured:
### Alarms
Alarms which are triggered by single bits from the device. Uses signals for `trigger` (when an alarm is triggered). `ackOut` when an acknowledge has occurred from the device and `ackIn` if the acknowledge came from MQTT. Refere to the documentation of the [alarmhandlermqtt](../../packages/alarmhandlermqtt/) and the [examples](./examples/alarms/) 
### Command
Commands are used for requesting an (parametrized) action from the device and optionally receive a (parametrized) response. - [examples](./examples//commands/)
### Event
Events are used for triggering MQTT messages from the device. - [examples](./examples/events/)
### Input
Inputs are used for writing values incoming from MQTT directly to the device. - [examples](./examples/inputs/)
### Output
Outputs are used for pushing data points as MQTT messages. - [examples](./examples/outputs/)

See also the complete [examples](./examples/) and the documentation of the [s7endpoint](../../packages/s7endpoint/) package.

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
