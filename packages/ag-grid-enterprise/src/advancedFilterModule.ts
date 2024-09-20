import type { _AdvancedFilterGridApi } from 'ag-grid-community';
import { ModuleNames, _FilterCoreModule, _defineModule } from 'ag-grid-community';
import { EnterpriseCoreModule } from './main';

import {
    getAdvancedFilterModel,
    hideAdvancedFilterBuilder,
    setAdvancedFilterModel,
    showAdvancedFilterBuilder,
} from './advancedFilter/advancedFilterApi';
import { AdvancedFilterExpressionService } from './advancedFilter/advancedFilterExpressionService';
import { AdvancedFilterService } from './advancedFilter/advancedFilterService';
import { VERSION } from './version';

export const AdvancedFilterCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.AdvancedFilterModule}-core`,
    beans: [AdvancedFilterService, AdvancedFilterExpressionService],
    dependantModules: [EnterpriseCoreModule, _FilterCoreModule],
});

export const AdvancedFilterApiModule = _defineModule<_AdvancedFilterGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.AdvancedFilterModule}-api`,
    apiFunctions: {
        getAdvancedFilterModel,
        setAdvancedFilterModel,
        showAdvancedFilterBuilder,
        hideAdvancedFilterBuilder,
    },
    dependantModules: [AdvancedFilterCoreModule],
});

export const AdvancedFilterModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.AdvancedFilterModule,
    dependantModules: [AdvancedFilterCoreModule, AdvancedFilterApiModule],
});
