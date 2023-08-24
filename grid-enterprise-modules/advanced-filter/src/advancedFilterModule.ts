import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { AdvancedFilterBuilderComp } from "./advancedFilter/advancedFilterBuilderComp";
import { AdvancedFilterBuilderRowComp } from "./advancedFilter/advancedFilterBuilderRowComp";
import { AdvancedFilterComp } from "./advancedFilter/advancedFilterComp";
import { AdvancedFilterExpressionService } from "./advancedFilter/advancedFilterExpressionService";
import { AdvancedFilterService } from "./advancedFilter/advancedFilterService";
import { VERSION } from "./version";

export const AdvancedFilterModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.AdvancedFilterModule,
    beans: [AdvancedFilterService, AdvancedFilterExpressionService],
    agStackComponents: [
        { componentName: 'agAdvancedFilter', componentClass: AdvancedFilterComp },
        { componentName: 'agAdvancedFilterBuilder', componentClass: AdvancedFilterBuilderComp },
        { componentName: 'agAdvancedFilterBuilderRow', componentClass: AdvancedFilterBuilderRowComp },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
