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

#postgres: everything set via environment variables (can also be set as yaml)

items:
  - topic: A/+/C #the topic to subscribe to
    # NOTE: You can have multiple variants in one level, when "+" is to much to subscribe to.
    # Split the variants by a "+" e. g. A/aa+bb/C
    table: testtable #the table to insert into
    topicValues: _/info/_ #define value keys in the topic tree which get inserted too
    payloadValues:
      value: "@this" #define search paths and keys for values taken from the message payload.
      # Can be array to create multiple inserts from one message
    constValues:
      name: foo #define constant key value pairs which are inserted along the other values
      # Can be array to create multiple inserts from one message
    timestampValues:
      - time #define keys which are inserted by the current timestamp
    messageThrottleMS: 500 #throttles the incoming messages (if you have wildcards in the topic they share the throttle time)
    minValueTimeDiffMS: 100 #throttles the incoming values (if you have wildcards in the topic, each topic has its individual time)
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
