# @woifes/s7endpoint

## Why?
This package is an adapter package for connecting to S7 PLCs via the S7-Protocol (RFC1006) to use for further implementations. It is first based on [node-snap7](node-snap7) which itself is based on [snap7](snap7). It may be changed to [nodes7](nodes7). For this reason the tag addressing of [nodes7](nodes7) is used.<br>
The package provides a *remote* and a *local* implementation. The *remote* implementation fetches and writes the data from a real PLC while the *local* implementation makes use of the [node-snap7](node-snap7) server implementation. Since the server implementation is flagged as unstable and it is not well documented (even no typescript types exist) it is at least as unstable as the underlying implementation.

> I have only used the package with S7 1200 PLCs and the LOGO! logic controller

**Please check the source code before using this package**

## Installation
Package not (yet) published

## Quick start
```typescript
    const s7Endpoint = new S7RemoteEndpoint({
        name: "myS7Endpoint",
        endpointIp: "192.168.1.1",
        rack: 20,
        slot: 0,
        selfRack: 10,
        selfSlot: 0,
    });

    const readRequest = s7Endpoint.createReadRequest([
        { area: "DB", dbNr: 1, byteIndex: 0, type: "INT8" },
        { area: "DB", dbNr: 50, byteIndex: 12, type: "UINT16" },
        { area: "DB", dbNr: 199, byteIndex: 14, type: "FLOAT" },
    ]);

    const result = await readRequest.execute();
    /*
        { area: "DB", dbNr: 1, byteIndex: 0, type: "INT8", value: 123 }
        { area: "DB", dbNr: 50, byteIndex: 12, type: "UINT16", value: 456 }
        { area: "DB", dbNr: 199, byteIndex: 14, type: "FLOAT", value: 1.24 }
    */

    const writeRequest = s7Endpoint.createWriteRequest([
        { area: "DB", dbNr: 7, byteIndex: 2, type: "INT8", value: 99 },
        { area: "DB", dbNr: 11, byteIndex: 4, type: "UINT16", value: 109 },
        { area: "DB", dbNr: 17, byteIndex: 6, type: "FLOAT", value: 3.45 },
    ]);

    await writeRequest.execute();
```
### Remarks using local endpoint (S7 Server)
The local (server) endpoint generates a csv file which can be perpared in order to import it in WinCC. The following steps have to be done:

* Create a S7 300 connection in WinCC (be aware that only the data types if a S7 300 PLC can be used)
* Take the generated csv and open it in Excel/Libreoffice and save it as .xlsx file
* Swap the placeholder name of the connection ("Con01") to the name of the connection in your WinCC project
* Rename the table sheet to "Hmi tags"
* Import it in WinCC

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
### Requests
* Option to not use "all or nothing" (not Promise.all).
* MultiVar option for low number of tags (or automatically detected by a PDU size check)
* Make WriteRequest reusable with different values?

[snap7]: https://snap7.sourceforge.net/
[node-snap7]: https://www.npmjs.com/package/node-snap7
[nodes7]: https://www.npmjs.com/package/nodes7