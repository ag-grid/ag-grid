import type { _AdvancedFilterGridApi, _ModuleWithApi } from 'ag-grid-community';
import {
    TooltipModule,
    _FilterCoreModule,
    _FilterValueModule,
    _PopupModule,
    _SharedDragAndDropModule,
} from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import advancedFilterCSS from './advanced-filter.css';
import {
    getAdvancedFilterModel,
    hideAdvancedFilterBuilder,
    setAdvancedFilterModel,
    showAdvancedFilterBuilder,
} from './advancedFilterApi';
import { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import { AdvancedFilterService } from './advancedFilterService';
import { AdvancedFilterSetService } from './set/advancedFilterSetService';

/**
 * @feature Filtering -> Advanced Filter
 * @gridOption enableAdvanced Filter
 */
export const AdvancedFilterModule: _ModuleWithApi<_AdvancedFilterGridApi> = {
    moduleName: 'AdvancedFilter',
    version: VERSION,
    beans: [AdvancedFilterService, AdvancedFilterExpressionService, AdvancedFilterSetService],
    apiFunctions: {
        getAdvancedFilterModel,
        setAdvancedFilterModel,
        showAdvancedFilterBuilder,
        hideAdvancedFilterBuilder,
    },
    dependsOn: [
        EnterpriseCoreModule,
        _FilterCoreModule,
        _SharedDragAndDropModule,
        _PopupModule,
        _FilterValueModule,
        TooltipModule,
    ],
    css: [advancedFilterCSS],
};
