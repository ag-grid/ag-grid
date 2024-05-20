import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { ChartService } from "./charts/chartService";
import { ChartTranslationService } from "./charts/chartComp/services/chartTranslationService";
import { ChartCrossFilterService } from "./charts/chartComp/services/chartCrossFilterService";
import { AgColorPicker } from "./widgets/agColorPicker";
import { AgAngleSelect } from "./widgets/agAngleSelect";
import { VERSION as GRID_VERSION } from "./version";
import { validGridChartsVersion } from "./utils/validGridChartsVersion";
import { ChartMenuListFactory } from "./charts/chartComp/menu/chartMenuList";
import { ChartMenuService } from "./charts/chartComp/services/chartMenuService";
import { AgPillSelect } from "./widgets/agPillSelect";
import { AdvancedSettingsMenuFactory } from "./charts/chartComp/menu/advancedSettings/advancedSettingsMenuFactory";
import { AgColorInput } from "./widgets/agColorInput";

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
        ChartService, ChartTranslationService, ChartCrossFilterService, ChartMenuListFactory, ChartMenuService, AdvancedSettingsMenuFactory
    ],
    agStackComponents: [
        { componentName: 'AgColorPicker', componentClass: AgColorPicker },
        { componentName: 'AgAngleSelect', componentClass: AgAngleSelect },
        { componentName: 'AgPillSelect', componentClass: AgPillSelect },
        { componentName: 'AgColorInput', componentClass: AgColorInput },
    ],
    dependantModules: [
        RangeSelectionModule,
        EnterpriseCoreModule
    ]
};
