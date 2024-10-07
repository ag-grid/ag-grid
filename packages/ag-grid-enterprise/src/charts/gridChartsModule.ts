import type { _GridChartsGridApi, _ModuleWithApi, _ModuleWithoutApi } from 'ag-grid-community';
import { DragAndDropModule, ModuleRegistry, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import type { ILicenseManager } from '../license/shared/licenseManager';
import { LicenseManager } from '../license/shared/licenseManager';
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
import type { ChartWrapperParams } from './chartWrapper';
import { ChartWrapper } from './chartWrapper';
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

export const GridChartsCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('GridChartsCoreModule'),
    validate: () => {
        return validGridChartsVersion({
            gridVersion: GRID_VERSION,
            chartsVersion: ChartWrapper.CHARTS_VERSION,
        });
    },
    beans: [
        ChartWrapper,
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

export const GridChartsApiModule: _ModuleWithApi<_GridChartsGridApi> = {
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

// export const GridChartsModule: _ModuleWithoutApi = {
//     ...baseEnterpriseModule('GridChartsModule'),
//     dependsOn: [GridChartsCoreModule, GridChartsApiModule],
// };

const buildGridChartsModule: (chartInstance: ChartWrapperParams) => _ModuleWithoutApi = (chartInstance) => {
    chartInstance.setupModules();

    ChartWrapper.setup(chartInstance);

    return {
        ...baseEnterpriseModule('GridChartsModule'),
        beans: [ChartWrapper],
        dependsOn: [GridChartsCoreModule, GridChartsApiModule],
    };
};

export const setupCommunityIntegratedCharts = (chartInstance: ChartWrapperParams) => {
    ModuleRegistry.registerModules([buildGridChartsModule(chartInstance)]);
};

export const setupEnterpriseIntegratedCharts = (chartInstance: ChartWrapperParams) => {
    const charts = chartInstance.AgCharts;
    charts.setGridContext(true);

    LicenseManager.setChartsLicenseManager(charts as ILicenseManager);
    setupCommunityIntegratedCharts(chartInstance);
};
