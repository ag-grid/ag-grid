import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ChartService } from "./charts/chartService";
import { ChartTranslationService } from "./charts/chartComp/services/chartTranslationService";
import { ChartCrossFilterService } from "./charts/chartComp/services/chartCrossFilterService";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
export const GridChartsModule = {
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslationService, ChartCrossFilterService
    ],
    dependantModules: [
        RangeSelectionModule,
        EnterpriseCoreModule
    ]
};
