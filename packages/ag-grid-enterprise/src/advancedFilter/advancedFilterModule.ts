import type { _AdvancedFilterGridApi } from 'ag-grid-community';
import { DragAndDropModule, FilterCoreModule, FilterValueModule, ModuleNames, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import {
    getAdvancedFilterModel,
    hideAdvancedFilterBuilder,
    setAdvancedFilterModel,
    showAdvancedFilterBuilder,
} from './advancedFilterApi';
import { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import { AdvancedFilterService } from './advancedFilterService';

export const AdvancedFilterCoreModule = defineEnterpriseModule('AdvancedFilterCoreModule', {
    beans: [AdvancedFilterService, AdvancedFilterExpressionService],
    dependsOn: [EnterpriseCoreModule, FilterCoreModule, DragAndDropModule, PopupModule, FilterValueModule],
});

export const AdvancedFilterApiModule = defineEnterpriseModule<_AdvancedFilterGridApi>('AdvancedFilterApiModule', {
    apiFunctions: {
        getAdvancedFilterModel,
        setAdvancedFilterModel,
        showAdvancedFilterBuilder,
        hideAdvancedFilterBuilder,
    },
    dependsOn: [AdvancedFilterCoreModule],
});

export const AdvancedFilterModule = defineEnterpriseModule(ModuleNames.AdvancedFilterModule, {
    dependsOn: [AdvancedFilterCoreModule, AdvancedFilterApiModule],
});
