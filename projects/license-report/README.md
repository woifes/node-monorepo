# @woifes/license-report

## Why?
This package provides a script to create a license report from a repository managed by [pnpm](https://pnpm.io/).

## Quick start
Install the package globally or as devDependency. Execute the script ```license-report```.

## License determination
* The package uses the ```pnpm list``` script to print the dependency tree of the package (no dev dependencies) in the current working directory. From there it parses the package name and license of every package. The package.json of each package will be fetched from the registry and from this the license field will be used.
* If you re run the report generation a already existing license report will first red back to save time fetching the package.json
* If a license can not be determined a prompt will ask for the license. You should use a standard license identifier like it is required in a package.json. Otherwise the summary might not be correct.
* If your package is part of a monorepo and has cross linked packages as dependency it tries to resolve the path of the package.json directly.

## Installation
```shell
npm i -D @woifes/license-report
```

## Running the build

The project is part of a monorepo. If the project is checked out in this environment use the following scripts:

TypeScript build:

```shell
pnpm run compile
```