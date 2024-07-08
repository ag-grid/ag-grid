import type { _GridChartsGridApi } from '@ag-grid-community/core';
import { ModuleNames, _defineModule } from '@ag-grid-community/core';
import { AgMenuItemRenderer, EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

import { AdvancedSettingsMenuFactory } from './charts/chartComp/menu/advancedSettings/advancedSettingsMenuFactory';
import { ChartMenuListFactory } from './charts/chartComp/menu/chartMenuList';
import { ChartCrossFilterService } from './charts/chartComp/services/chartCrossFilterService';
import { ChartMenuService } from './charts/chartComp/services/chartMenuService';
import { ChartTranslationService } from './charts/chartComp/services/chartTranslationService';
import { ChartService } from './charts/chartService';
import {
    closeChartToolPanel,
    createCrossFilterChart,
    createPivotChart,
    createRangeChart,
    downloadChart,
    getChartImageDataURL,
    getChartModels,
    getChartRef,
    openChartToolPanel,
    restoreChart,
    updateChart,
} from './charts/chartsApi';
import { validGridChartsVersion } from './utils/validGridChartsVersion';
import { VERSION as GRID_VERSION } from './version';

export const GridChartsCoreModule = _defineModule({
    version: GRID_VERSION,
    validate: () => {
        return validGridChartsVersion({
            gridVersion: GRID_VERSION,
            chartsVersion: ChartService.CHARTS_VERSION,
        });
    },
    moduleName: `${ModuleNames.GridChartsModule}-core`,
    beans: [
        ChartService,
        ChartTranslationService,
        ChartCrossFilterService,
        ChartMenuListFactory,
        ChartMenuService,
        AdvancedSettingsMenuFactory,
    ],
    userComponents: [
        {
            name: 'agMenuItem',
            classImp: AgMenuItemRenderer,
        },
    ],
    dependantModules: [RangeSelectionModule, EnterpriseCoreModule],
});

export const GridChartsApiModule = _defineModule<_GridChartsGridApi>({
    version: GRID_VERSION,
    moduleName: `${ModuleNames.GridChartsModule}-api`,
    apiFunctions: {
        getChartModels,
        getChartRef,
        getChartImageDataURL,
        downloadChart,
        openChartToolPanel,
        closeChartToolPanel,
        createRangeChart,
        createPivotChart,
        createCrossFilterChart,
        updateChart,
        restoreChart,
    },
    dependantModules: [GridChartsCoreModule],
});

export const GridChartsModule = _defineModule({
    version: GRID_VERSION,
    moduleName: ModuleNames.GridChartsModule,
    dependantModules: [GridChartsCoreModule, GridChartsApiModule],
});
