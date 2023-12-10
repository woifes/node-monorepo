<div id="top"></div>

<br>
<div align="center">
  <a href="https://github.com/woifes/@woifes/monorepo">
    <img src="images/woifeslogo.svg" alt="Logo" width="180" height="180">
  </a>
</div>
<h1 align="center">@woifes/node-monorepo</h3>

# Overview
This is the monorepo is holding various packages and projects. It is the result of combining different projects which were originally managed by subversion and synchronized with the "externals" feature. During this combination the code bases were mostly rewritten. Most of the projects are intent to use with a mqtt broker.

## Packages
* [alarmhandler](/packages/alarmhandler/) - Simple alarm handler
* [alarmhandlermqtt](/packages/alarmhandlermqtt/) - MQTT extension of the [alarmhandler](/packages/alarmhandler/) package
* [binarytypes](/packages/binarytypes/) - Handles binary datatypes
* [gjson](/packages/gjson/) - Implementation of the [GJSON](https://github.com/tidwall/gjson) json document search
* [mqtt-client](/packages/mqtt-client/) - Facade for the mqtt package
* [s7endpoint](/packages/s7endpoint/) - Adapter package for connecting via S7 protocol (RFC1006)
* [util](/packages/util/) - Collection of helper functions, types or classes

## Projects
* [license-report](/projects/license-report/) - Generate a license report in the other packages and projects
* [matrix-mqtt-bridge](/projects/matrix-mqtt-bridge/) - Generate a list of rooms and send an receive messages from that room via mqtt
* [mqtt-influxdb-agent](/projects/mqtt-influxdb-agent/) - Agent for sending data from MQTT into InfluxDB 2.x
* [mqtt-postgres-agent](/projects/mqtt-postgres-agent/) - Agent for sending data from MQTT into Postgres DB
* [s7mqtt](/projects/s7mqtt/) - MQTT gateway for devices which use the S7 protocol (RFC1006)
* [yasdi-mqtt](/projects/yasdi-mqtt/) - MQTT version of [node-yasdi](https://www.npmjs.com/package/@woifes/node-yasdi)
* [yasdi-rest](/projects/yasdi-rest/) - Extends [node-yasdi](https://www.npmjs.com/package/@woifes/node-yasdi) by REST endpoints

<p align="right">(<a href="#top">back to top</a>)</p>

# Roadmap

# License

The license of the different packages or projects are stated inside the corresponding sub folders:
> Note: If a package is "UNLICENSED" I did not decided which license to use yet
## Packages
* [alarmhandler](/packages/alarmhandler/) - MIT
* [alarmhandlermqtt](/packages/alarmhandlermqtt/) - AGPL-3.0-or-later
* [binarytypes](/packages/binarytypes/) - MIT
* [gjson](/packages/gsjon/) - MIT
* [mqtt-client](/packages/mqtt-client/) - AGPL-3.0-or-later
* [s7endpoint](/packages/s7endpoint/) - MIT
* [util](/packages/util/) - MIT

## Projects
* [license-report](/projects/license-report/) - MIT
* [matrix-mqtt-bridge](/projects/matrix-mqtt-bridge/) - AGPL-3.0-or-later
* [mqtt-influxdb-agent](/projects/mqtt-influxdb-agent/) - MIT
* [mqtt-postgres-agent](/projects/mqtt-postgres-agent/) - MIT
* [s7mqtt](/projects/s7mqtt/) - AGPL-3.0-or-later
* [yasdi-mqtt](/projects/yasdi-mqtt/) - MIT
* [yasdi-rest](/projects/yasdi-mqtt/) - MIT

<p align="right">(<a href="#top">back to top</a>)</p>

# Acknowledgments

* [pnpm](https://pnpm.io/) - A very good package manager
* [runtypes](https://github.com/pelotom/runtypes) - A very powerful package for validating types
* [MQTT.js](https://www.npmjs.com/package/mqtt) - The one and only
* [matrix](https://matrix.org/) - The future of communication
* [biome](https://biomejs.dev/) - Fast and easy to use linter and formatter

<p align="right">(<a href="#top">back to top</a>)</p>
