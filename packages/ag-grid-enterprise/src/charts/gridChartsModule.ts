import type { Module, ModuleWithApi, _GridChartsGridApi } from 'ag-grid-community';
import { DragAndDropModule, ModuleNames, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { RangeSelectionModule } from '../rangeSelection/rangeSelectionModule';
import { VERSION as GRID_VERSION } from '../version';
import { AgMenuItemRenderer } from '../widgets/agMenuItemRenderer';
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

export const GridChartsCoreModule: Module = {
    ...baseEnterpriseModule('GridChartsCoreModule'),
    validate: () => {
        return validGridChartsVersion({
            gridVersion: GRID_VERSION,
            chartsVersion: ChartService.CHARTS_VERSION,
        });
    },
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
    dependsOn: [RangeSelectionModule, EnterpriseCoreModule, DragAndDropModule, PopupModule],
};

export const GridChartsApiModule: ModuleWithApi<_GridChartsGridApi> = {
    ...baseEnterpriseModule('GridChartsApiModule'),
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
    dependsOn: [GridChartsCoreModule],
};

export const GridChartsModule: Module = {
    ...baseEnterpriseModule(ModuleNames.GridChartsModule),
    dependsOn: [GridChartsCoreModule, GridChartsApiModule],
};
