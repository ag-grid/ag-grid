import { Module, ModuleNames } from '@ag-grid-community/core';
import { AgAdvancedFilter } from './advancedFilter/agAdvancedFilter';
import { AdvancedFilterExpressionService } from './advancedFilter/advancedFilterExpressionService';
import { AdvancedFilterService } from './advancedFilter/advancedFilterService';
import { VERSION } from './version';
import { AgAutocomplete } from './advancedFilter/autocomplete/agAutocomplete';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

export const AdvancedFilterModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.AdvancedFilterModule,
    beans: [AdvancedFilterService, AdvancedFilterExpressionService],
    agStackComponents: [AgAutocomplete, AgAdvancedFilter],
    dependantModules: [EnterpriseCoreModule],
};
