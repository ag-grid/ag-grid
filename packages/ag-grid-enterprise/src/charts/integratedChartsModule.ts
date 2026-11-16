import type { IntegratedModule } from 'ag-charts-types';

import type { Module, ModuleName, _GridChartsGridApi, _ModuleWithApi } from 'ag-grid-community';
import { _PopupModule, _SharedDragAndDropModule, _setAgPackageInfo } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import type { ILicenseManager } from '../license/shared/licenseManager';
import { LicenseManager } from '../license/shared/licenseManager';
import { CellSelectionModule } from '../rangeSelection/rangeSelectionModule';
import { VERSION } from '../version';
import { MenuItemModule } from '../widgets/menuItemModule';
import { AgChartsExports } from './agChartsExports';
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
import integratedChartsModuleCSS from './integratedChartsModule.css';
import { validGridChartsVersion } from './utils/validGridChartsVersion';

type IntegratedChartsModuleType = {
    with: (params: IntegratedModule) => _ModuleWithApi<_GridChartsGridApi>;
} & _ModuleWithApi<_GridChartsGridApi>;

const apiFunctions: _ModuleWithApi<_GridChartsGridApi>['apiFunctions'] = {
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
};

const dependsOn: Module[] = [
    CellSelectionModule,
    EnterpriseCoreModule,
    _SharedDragAndDropModule,
    _PopupModule,
    MenuItemModule,
];
const moduleName: ModuleName = 'IntegratedCharts';

/**
 * @feature Integrated Charts
 * Requires the AG Charts library to be provided to this module via the `with` method.
 * The AG Charts module can be imported from either `ag-charts-community` or `ag-charts-enterprise`.
 * @example
 * import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';
 * import { ModuleRegistry } from 'ag-grid-community';
 * import { IntegratedChartsModule } from 'ag-grid-enterprise';
 *
 * ModuleRegistry.registerModules([ IntegratedChartsModule.with(AgChartsEnterpriseModule) ]);
 */
export const IntegratedChartsModule: IntegratedChartsModuleType = {
    moduleName,
    version: VERSION,
    dependsOn, // included to avoid other false positive warnings about missing modules
    validate: () => {
        return {
            isValid: false,
            errorId: 257,
        };
    },
    with: (params) => {
        params.setup();
        params.setGridContext?.(true);
        if (params.isEnterprise && params.setLicenseKey) {
            const chartsManager: ILicenseManager = {
                setLicenseKey: params.setLicenseKey,
            };
            LicenseManager.setChartsLicenseManager(chartsManager);
        }

        const module: _ModuleWithApi<_GridChartsGridApi> = {
            moduleName,
            version: VERSION,
            apiFunctions,
            dependsOn,
            css: [integratedChartsModuleCSS],
            validate: () => {
                return validGridChartsVersion({
                    gridVersion: VERSION,
                    chartsVersion: params.VERSION,
                });
            },
            beans: [
                // bind the params to the constructor to avoid the need for static properties
                AgChartsExports.bind(null, params),
                ChartService,
                ChartTranslationService,
                ChartCrossFilterService,
                ChartMenuListFactory,
                ChartMenuService,
                // Include enterprise beans for now for all users as tiny compared to charts bundle size
                EnterpriseChartProxyFactory,
                AdvancedSettingsMenuFactory,
            ],
        };
        _setAgPackageInfo(module, params.isEnterprise ? 'ag-charts-enterprise' : 'ag-charts-community', params.VERSION);
        return module;
    },
};
