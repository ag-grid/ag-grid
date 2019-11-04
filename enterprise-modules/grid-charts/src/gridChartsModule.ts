import {Module, ModuleNames} from "@ag-grid-community/grid-core";
import {EnterpriseCoreModule} from "@ag-grid-enterprise/grid-core";
import {ChartService} from "./chartAdaptor/chartService";
import {ChartTranslator} from "./chartAdaptor/chartComp/chartTranslator";

import {RangeSelectionModule} from "@ag-grid-enterprise/grid-range-selection";

export const GridChartsModule: Module = {
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslator
    ],
    dependantModules: [
        RangeSelectionModule,
        EnterpriseCoreModule
    ]
};

