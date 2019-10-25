import { ModuleNames } from "@ag-community/grid-core";
import { EnterpriseCoreModule } from "@ag-enterprise/grid-core";
import { ChartService } from "./chartAdaptor/chartService";
import { ChartTranslator } from "./chartAdaptor/chartComp/chartTranslator";
import { RangeSelectionModule } from "@ag-enterprise/grid-range-selection";
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
