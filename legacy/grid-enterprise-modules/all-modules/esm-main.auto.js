import {ModuleRegistry} from "@ag-grid-community/core";
import {AllEnterpriseModules} from "./dist/esm/es6/main";

ModuleRegistry.registerModules(AllEnterpriseModules);

export * from "./dist/esm/es6/main";
