import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ChartService } from "./charts/chartService";
import { ChartTranslator } from "./charts/chartComp/chartTranslator";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
export var GridChartsModule = {
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslator
    ],
    dependantModules: [
        RangeSelectionModule,
        EnterpriseCoreModule
    ]
};
