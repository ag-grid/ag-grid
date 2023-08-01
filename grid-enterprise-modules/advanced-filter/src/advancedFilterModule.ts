import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { AdvancedFilterComp } from "./advancedFilter/advancedFilterComp";
import { AdvancedFilterService } from "./advancedFilter/advancedFilterService";
import { VERSION } from "./version";

export const AdvancedFilterModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.AdvancedFilterModule,
    beans: [AdvancedFilterService],
    agStackComponents: [
        { componentName: 'agAdvancedFilter', componentClass: AdvancedFilterComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
