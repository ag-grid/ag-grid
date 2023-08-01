import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { VERSION } from "./version";

export const AdvancedFilterModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.AdvancedFilterModule,
    beans: [],
    agStackComponents: [
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
