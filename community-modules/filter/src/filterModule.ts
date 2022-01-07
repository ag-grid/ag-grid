import { Module, ModuleNames } from "@ag-grid-community/core";
import { IFilterAdapter } from "./adapters/iFilterAdapter";
import { IFilterManagerAdapter } from "./adapters/iFilterManagerAdapter";
import { AdvancedV1FilterController } from "./controllers/advancedV1FilterController";
import { AdvancedV2FilterController } from "./controllers/advancedV2FilterController";
import { ExternalFilterController } from "./controllers/externalFilterController";
import { QuickFilterController } from "./controllers/quickFilterController";
import { EvaluationModelFactory } from "./evaluation-model/evaluationModelFactory";
import { FILTER_TO_EXPRESSION_TYPE_MAPPING } from "./filterMapping";
import { FilterStateManager } from "./state/filterStateManager";

export const FilterModule: Module = {
    moduleName: ModuleNames.FilterModule,
    beans: [EvaluationModelFactory, IFilterManagerAdapter, FilterStateManager, QuickFilterController, ExternalFilterController, AdvancedV1FilterController, AdvancedV2FilterController],
    userComponents: Object.keys(FILTER_TO_EXPRESSION_TYPE_MAPPING)
        .map((componentName) => ({ componentClass: IFilterAdapter, componentName })),
};
