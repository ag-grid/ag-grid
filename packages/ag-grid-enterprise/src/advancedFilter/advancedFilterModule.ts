import type { Module, ModuleWithApi, _AdvancedFilterGridApi } from 'ag-grid-community';
import { DragAndDropModule, FilterCoreModule, FilterValueModule, ModuleNames, PopupModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import {
    getAdvancedFilterModel,
    hideAdvancedFilterBuilder,
    setAdvancedFilterModel,
    showAdvancedFilterBuilder,
} from './advancedFilterApi';
import { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import { AdvancedFilterService } from './advancedFilterService';

export const AdvancedFilterCoreModule: Module = {
    ...baseEnterpriseModule('AdvancedFilterCoreModule'),
    beans: [AdvancedFilterService, AdvancedFilterExpressionService],
    dependsOn: [EnterpriseCoreModule, FilterCoreModule, DragAndDropModule, PopupModule, FilterValueModule],
};

export const AdvancedFilterApiModule: ModuleWithApi<_AdvancedFilterGridApi> = {
    ...baseEnterpriseModule('AdvancedFilterApiModule'),
    apiFunctions: {
        getAdvancedFilterModel,
        setAdvancedFilterModel,
        showAdvancedFilterBuilder,
        hideAdvancedFilterBuilder,
    },
    dependsOn: [AdvancedFilterCoreModule],
};

export const AdvancedFilterModule: Module = {
    ...baseEnterpriseModule(ModuleNames.AdvancedFilterModule),
    dependsOn: [AdvancedFilterCoreModule, AdvancedFilterApiModule],
};
