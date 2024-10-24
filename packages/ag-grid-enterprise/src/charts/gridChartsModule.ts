import { VERSION as CHARTS_VERSION } from 'ag-charts-community';

import type { _GridChartsGridApi, _ModuleWithApi, _ModuleWithoutApi } from 'ag-grid-community';
import { DragAndDropModule, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { RangeSelectionModule } from '../rangeSelection/rangeSelectionModule';
import { VERSION as GRID_VERSION } from '../version';
import { MenuItemModule } from '../widgets/menuItemModule';
import { EnterpriseChartProxyFactory } from './chartComp/chartProxies/enterpriseChartProxyFactory';
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

export const GridChartsCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('GridChartsCoreModule'),
    validate: () => {
        return validGridChartsVersion({
            gridVersion: GRID_VERSION,
            chartsVersion: CHARTS_VERSION,
        });
    },
    beans: [ChartService, ChartTranslationService, ChartCrossFilterService, ChartMenuListFactory, ChartMenuService],
    icons: {
        // shown on top right of chart when chart is linked to range data (click to unlink)
        linked: 'linked',
        // shown on top right of chart when chart is not linked to range data (click to link)
        unlinked: 'unlinked',
        // icon to open charts menu
        chartsMenu: 'menu-alt',
        // download chart
        chartsDownload: 'save',
        // Edit Chart menu item shown in Integrated Charts menu
        chartsMenuEdit: 'chart',
        // Advanced Settings menu item shown in Integrated Charts menu
        chartsMenuAdvancedSettings: 'settings',
        // shown in Integrated Charts menu add fields
        chartsMenuAdd: 'plus',
        // shown in Integrated Charts tool panel color picker
        chartsColorPicker: 'small-down',
        // previous in Integrated Charts settings tool panel theme switcher
        chartsThemePrevious: 'previous',
        // next in Integrated Charts settings tool panel theme switcher
        chartsThemeNext: 'next',
    },
    dependsOn: [RangeSelectionModule, EnterpriseCoreModule, DragAndDropModule, PopupModule, MenuItemModule],
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

export const GridChartsEnterpriseFeaturesModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('GridChartsEnterpriseFeaturesModule'),
    beans: [EnterpriseChartProxyFactory, AdvancedSettingsMenuFactory],
};

export const GridChartsModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('GridChartsModule'),
    dependsOn: [GridChartsCoreModule, GridChartsApiModule, GridChartsEnterpriseFeaturesModule],
};
