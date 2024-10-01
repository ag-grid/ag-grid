import type { _StatusBarGridApi } from 'ag-grid-community';
import { KeyboardNavigationCoreModule, ModuleNames, RowSelectionCoreModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
import { AggregationComp } from './providedPanels/aggregationComp';
import { FilteredRowsComp } from './providedPanels/filteredRowsComp';
import { SelectedRowsComp } from './providedPanels/selectedRowsComp';
import { TotalAndFilteredRowsComp } from './providedPanels/totalAndFilteredRowsComp';
import { TotalRowsComp } from './providedPanels/totalRowsComp';
import { getStatusPanel } from './statusBarApi';
import { StatusBarService } from './statusBarService';

export const StatusBarCoreModule = defineEnterpriseModule('StatusBarCoreModule', {
    beans: [StatusBarService],
    userComponents: [
        { name: 'agAggregationComponent', classImp: AggregationComp },
        { name: 'agTotalRowCountComponent', classImp: TotalRowsComp },
        { name: 'agFilteredRowCountComponent', classImp: FilteredRowsComp },
        { name: 'agTotalAndFilteredRowCountComponent', classImp: TotalAndFilteredRowsComp },
    ],
    dependsOn: [EnterpriseCoreModule, KeyboardNavigationCoreModule],
});

export const StatusBarSelectionModule = defineEnterpriseModule('StatusBarSelectionModule', {
    userComponents: [{ name: 'agSelectedRowCountComponent', classImp: SelectedRowsComp }],
    dependsOn: [StatusBarCoreModule, RowSelectionCoreModule],
});

export const StatusBarApiModule = defineEnterpriseModule<_StatusBarGridApi>('StatusBarApiModule', {
    apiFunctions: {
        getStatusPanel,
    },
    dependsOn: [StatusBarCoreModule],
});

export const StatusBarModule = defineEnterpriseModule(ModuleNames.StatusBarModule, {
    dependsOn: [StatusBarCoreModule, StatusBarApiModule, StatusBarSelectionModule],
});
