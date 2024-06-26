import type { AdvancedFilterGridApi } from '@ag-grid-community/core';
import { ModuleNames, _FilterCoreModule, _defineModule } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

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

export const AdvancedFilterApiModule = _defineModule<AdvancedFilterGridApi>({
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
