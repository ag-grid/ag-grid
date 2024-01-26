import {ModuleRegistry} from "@ag-grid-community/core";
import {AllModules} from "./dist/esm/es6/main-enterprise";

ModuleRegistry.registerModules(AllModules);

export * from "./dist/esm/es6/main-enterprise";
