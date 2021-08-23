import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { SparklineCellRenderer } from "./sparklineCellRenderer";

export const SparklinesModule: Module = {
    moduleName: ModuleNames.SparklinesModule,
    beans: [],
    userComponents: [
        { componentName: 'agSparklineCellRenderer', componentClass: SparklineCellRenderer },
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};