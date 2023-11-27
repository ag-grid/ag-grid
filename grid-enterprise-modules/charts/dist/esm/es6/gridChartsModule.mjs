import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ChartService } from "./charts/chartService.mjs";
import { ChartTranslationService } from "./charts/chartComp/services/chartTranslationService.mjs";
import { ChartCrossFilterService } from "./charts/chartComp/services/chartCrossFilterService.mjs";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { AgColorPicker } from "./widgets/agColorPicker.mjs";
import { AgAngleSelect } from "./widgets/agAngleSelect.mjs";
import { VERSION as GRID_VERSION } from "./version.mjs";
import { validGridChartsVersion } from "./utils/validGridChartsVersion.mjs";
export const GridChartsModule = {
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
