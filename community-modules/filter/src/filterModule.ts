import { Module, ModuleNames } from "@ag-grid-community/core";
import { IFilterAdapter } from "./adapters/iFilterAdapter";
import { EvaluationModelFactory } from "./evaluation-model/evaluationModelFactory";
import { FilterManager } from "./filterManager";
import { FILTER_TO_EXPRESSION_TYPE_MAPPING } from "./filterMapping";
import { FilterStateManager } from "./state/filterStateManager";

export const FilterModule: Module = {
    moduleName: ModuleNames.FilterModule,
    beans: [EvaluationModelFactory, FilterManager, FilterStateManager],
    userComponents: Object.keys(FILTER_TO_EXPRESSION_TYPE_MAPPING)
        .map((componentName) => ({ componentClass: IFilterAdapter, componentName })),
};
