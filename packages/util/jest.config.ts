/* eslint-disable import/no-extraneous-dependencies */
import type { Config } from "@jest/types";
import { pathsToModuleNameMapper } from "ts-jest/utils";
// Load the config which holds the path aliases.
const requireJSON5 = require("require-json5");
const { compilerOptions } = requireJSON5('../../tsconfig.json');

const config: Config.InitialOptions = {
  preset: "ts-jest",
  
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    // This has to match the baseUrl defined in tsconfig.json.
    prefix: "<rootDir>/../../",
  }),
};

export default config;