import type { _AdvancedFilterGridApi } from 'ag-grid-community';
import {
    DragAndDropModule,
    FilterCoreModule,
    FilterValueModule,
    ModuleNames,
    PopupModule,
    _defineModule,
} from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import {
    getAdvancedFilterModel,
    hideAdvancedFilterBuilder,
    setAdvancedFilterModel,
    showAdvancedFilterBuilder,
} from './advancedFilterApi';
import { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import { AdvancedFilterService } from './advancedFilterService';

export const AdvancedFilterCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.AdvancedFilterModule}-core`,
    beans: [AdvancedFilterService, AdvancedFilterExpressionService],
    dependantModules: [EnterpriseCoreModule, FilterCoreModule, DragAndDropModule, PopupModule, FilterValueModule],
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
