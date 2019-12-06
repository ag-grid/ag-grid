import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ChartService } from "./chartAdaptor/chartService";
import { ChartTranslator } from "./chartAdaptor/chartComp/chartTranslator";
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
