import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ChartService } from "./charts/chartService";
import { ChartTranslator } from "./charts/chartComp/chartTranslator";
import { ChartCrossFilter } from "./charts/chartComp/chartCrossFilter";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
export var GridChartsModule = {
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslator, ChartCrossFilter
    ],
    dependantModules: [
        RangeSelectionModule,
        EnterpriseCoreModule
    ]
};
