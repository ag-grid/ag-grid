import type { Module } from '@ag-grid-community/core';
import { ModuleNames, _FilterCoreModule } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import {
    getAdvancedFilterModel,
    setAdvancedFilterModel,
    showAdvancedFilterBuilder,
} from './advancedFilter/advancedFilterApi';
import { AdvancedFilterComp } from './advancedFilter/advancedFilterComp';
import { AdvancedFilterExpressionService } from './advancedFilter/advancedFilterExpressionService';
import { AdvancedFilterService } from './advancedFilter/advancedFilterService';
import { AgAutocomplete } from './advancedFilter/autocomplete/agAutocomplete';
import { VERSION } from './version';

export const AdvancedFilterCoreModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.AdvancedFilterModule}-core`,
    beans: [AdvancedFilterService, AdvancedFilterExpressionService],
    agStackComponents: [AgAutocomplete, AdvancedFilterComp],
    dependantModules: [EnterpriseCoreModule, _FilterCoreModule],
};

export const AdvancedFilterApiModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.AdvancedFilterModule}-api`,
    apiFunctions: {
        getAdvancedFilterModel,
        setAdvancedFilterModel,
        showAdvancedFilterBuilder,
    },
    dependantModules: [AdvancedFilterCoreModule],
};

export const AdvancedFilterModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.AdvancedFilterModule,
    dependantModules: [AdvancedFilterCoreModule, AdvancedFilterApiModule],
};
