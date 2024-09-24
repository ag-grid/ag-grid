import type { _AdvancedFilterGridApi } from 'ag-grid-community';
import { DragAndDropModule, ModuleNames, _FilterCoreModule, _defineModule } from 'ag-grid-community';

import {
    getAdvancedFilterModel,
    hideAdvancedFilterBuilder,
    setAdvancedFilterModel,
    showAdvancedFilterBuilder,
} from './advancedFilterApi';
import { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import { AdvancedFilterService } from './advancedFilterService';
import { VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';

export const AdvancedFilterCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.AdvancedFilterModule}-core`,
    beans: [AdvancedFilterService, AdvancedFilterExpressionService],
    dependantModules: [EnterpriseCoreModule, _FilterCoreModule, DragAndDropModule],
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
