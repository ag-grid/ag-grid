import type { Module} from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { AdvancedFilterComp } from './advancedFilter/advancedFilterComp';
import { AdvancedFilterExpressionService } from './advancedFilter/advancedFilterExpressionService';
import { AdvancedFilterService } from './advancedFilter/advancedFilterService';
import { AgAutocomplete } from './advancedFilter/autocomplete/agAutocomplete';
import { VERSION } from './version';

export const AdvancedFilterModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.AdvancedFilterModule,
    beans: [AdvancedFilterService, AdvancedFilterExpressionService],
    agStackComponents: [AgAutocomplete, AdvancedFilterComp],
    dependantModules: [EnterpriseCoreModule],
};
