import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ChartService } from "./charts/chartService";
import { ChartTranslator } from "./charts/chartComp/chartTranslator";
import { ChartCrossFilter } from "./charts/chartComp/chartCrossFilter";

import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { SparklineCellRenderer } from "./charts/sparkline/sparklineCellRenderer";

export const GridChartsModule: Module = {
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslator, ChartCrossFilter
    ],
    userComponents: [
        { componentName: 'agSparklineCellRenderer', componentClass: SparklineCellRenderer },
    ],
    dependantModules: [
        RangeSelectionModule,
        EnterpriseCoreModule
    ]
};
