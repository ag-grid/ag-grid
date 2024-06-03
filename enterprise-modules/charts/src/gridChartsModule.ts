import type { Module } from '@ag-grid-community/core';
import { AgCheckbox, AgInputNumberField, AgSelect, ModuleNames } from '@ag-grid-community/core';
import { AgGroupComponent, AgMenuItemRenderer, EnterpriseCoreModule } from '@ag-grid-enterprise/core';
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
import { AgInputRange } from './widgets/agInputRange';
import { AgSlider } from './widgets/agSlider';

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
    // Register all the components that are used across all the chart comps to avoid repetition
    agStackComponents: [
        AgColorPicker,
        AgColorInput,
        AgAngleSelect,
        AgInputRange,
        AgSlider,
        AgGroupComponent,
        AgSelect,
        AgInputNumberField,
        AgCheckbox,
    ],
    userComponents: [
        {
            componentName: 'agMenuItem',
            componentClass: AgMenuItemRenderer,
        },
    ],
    dependantModules: [RangeSelectionModule, EnterpriseCoreModule],
};
