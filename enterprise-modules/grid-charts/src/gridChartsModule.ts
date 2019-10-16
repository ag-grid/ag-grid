import {Module, ModuleNames} from "@ag-community/grid-core";
import {ChartService} from "./chartAdaptor/chartService";
import {ChartTranslator} from "./chartAdaptor/chartComp/chartTranslator";

import {RangeSelectionModule} from "@ag-enterprise/range-selection";

export const GridChartsModule: Module = {
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslator
    ],
    dependantModules: [
        RangeSelectionModule
    ]
};

