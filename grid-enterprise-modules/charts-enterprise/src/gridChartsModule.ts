import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ChartService } from "./charts/chartService";
import { ChartTranslationService } from "./charts/chartComp/services/chartTranslationService";
import { ChartCrossFilterService } from "./charts/chartComp/services/chartCrossFilterService";

import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { AgColorPicker } from "./widgets/agColorPicker";
import { AgAngleSelect } from "./widgets/agAngleSelect";
import { VERSION as GRID_VERSION } from "./version";
import { validGridChartsVersion } from "./utils/validGridChartsVersion";

export const GridChartsModule: Module = {
    version: GRID_VERSION,
    validate: () => {
        return validGridChartsVersion({
            gridVersion: GRID_VERSION,
            chartsVersion: ChartService.CHARTS_VERSION
        });
    },
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService, ChartTranslationService, ChartCrossFilterService
    ],
    agStackComponents: [
        { componentName: 'AgColorPicker', componentClass: AgColorPicker },
        { componentName: 'AgAngleSelect', componentClass: AgAngleSelect },
    ],
    dependantModules: [
        RangeSelectionModule,
        EnterpriseCoreModule
    ]
};
