import { Module, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

import { AdvancedSettingsMenuFactory } from './charts/chartComp/menu/advancedSettings/advancedSettingsMenuFactory';
import { ChartMenuListFactory } from './charts/chartComp/menu/chartMenuList';
import { ChartCrossFilterService } from './charts/chartComp/services/chartCrossFilterService';
import { ChartMenuService } from './charts/chartComp/services/chartMenuService';
import { ChartTranslationService } from './charts/chartComp/services/chartTranslationService';
import { ChartService } from './charts/chartService';
import { validGridChartsVersion } from './utils/validGridChartsVersion';
import { VERSION as GRID_VERSION } from './version';
import { AgAngleSelect } from './widgets/agAngleSelect';
import { AgColorInput } from './widgets/agColorInput';
import { AgColorPicker } from './widgets/agColorPicker';
import { AgPillSelect } from './widgets/agPillSelect';

export const GridChartsModule: Module = {
    version: GRID_VERSION,
    validate: () => {
        return validGridChartsVersion({
            gridVersion: GRID_VERSION,
            chartsVersion: ChartService.CHARTS_VERSION,
        });
    },
    moduleName: ModuleNames.GridChartsModule,
    beans: [
        ChartService,
        ChartTranslationService,
        ChartCrossFilterService,
        ChartMenuListFactory,
        ChartMenuService,
        AdvancedSettingsMenuFactory,
    ],
    agStackComponents: [
        { componentName: 'AgColorPicker', componentClass: AgColorPicker },
        { componentName: 'AgAngleSelect', componentClass: AgAngleSelect },
        { componentName: 'AgPillSelect', componentClass: AgPillSelect },
        { componentName: 'AgColorInput', componentClass: AgColorInput },
    ],
    dependantModules: [RangeSelectionModule, EnterpriseCoreModule],
};
