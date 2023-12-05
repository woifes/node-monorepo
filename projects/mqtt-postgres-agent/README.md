# @woifes/mqtt-postgres-agent

## Why?
This project implements a generic agent which is able to take values from a mqtt message and pushes it into postgres db.

**Please check the source code before using this package**

## Installation
Package not (yet) published

## Quick start
```yaml
#docker compose yaml
version: '3.8'
services:
  agent:
    image: woifes/mqtt-postgres-agent:latest
    volumes:
      - ./config.yaml:/data/config.yaml
    environment:
      - PGHOST=postgres
      - PGDATABASE=postgres
      - PGUSER=postgres
```
```yaml
#config.yaml
mqtt:
url: mqtt://mqtt:1883
clientId: agent01
auth:
username: "user01"
password: "123456"

#postgres: everything set via environment variables

items:
  - topic: A/+/C #the topic to subscribe to
    table: testtable #the table to insert into
    topicValues: _/info/_ #define value keys in the topic tree which get inserted too
    payloadValues:
      value: "@this" #define search paths and keys for values taken from the message payload
    constValues:
      name: foo #define constant key value pairs which are inserted along the other values
    timestampValues:
      - time #define keys which are inserted by the current timestamp
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
