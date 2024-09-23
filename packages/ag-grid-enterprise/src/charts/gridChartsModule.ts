import type { _GridChartsGridApi } from 'ag-grid-community';
import { DragAndDropModule, ModuleNames, _defineModule } from 'ag-grid-community';

import { RangeSelectionModule } from '../rangeSelection/rangeSelectionModule';
import { AdvancedSettingsMenuFactory } from './chartComp/menu/advancedSettings/advancedSettingsMenuFactory';
import { ChartMenuListFactory } from './chartComp/menu/chartMenuList';
import { ChartCrossFilterService } from './chartComp/services/chartCrossFilterService';
import { ChartMenuService } from './chartComp/services/chartMenuService';
import { ChartTranslationService } from './chartComp/services/chartTranslationService';
import { ChartService } from './chartService';
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
} from './chartsApi';
import { validGridChartsVersion } from './utils/validGridChartsVersion';
import { VERSION as GRID_VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';

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
    dependantModules: [RangeSelectionModule, EnterpriseCoreModule, DragAndDropModule],
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
