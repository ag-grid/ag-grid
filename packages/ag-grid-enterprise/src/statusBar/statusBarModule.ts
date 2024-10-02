import type { Module, ModuleWithApi, _StatusBarGridApi } from 'ag-grid-community';
import { KeyboardNavigationCoreModule, ModuleNames } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { baseEnterpriseModule } from '../moduleUtils';
import { AggregationComp } from './providedPanels/aggregationComp';
import { FilteredRowsComp } from './providedPanels/filteredRowsComp';
import { SelectedRowsComp } from './providedPanels/selectedRowsComp';
import { TotalAndFilteredRowsComp } from './providedPanels/totalAndFilteredRowsComp';
import { TotalRowsComp } from './providedPanels/totalRowsComp';
import { getStatusPanel } from './statusBarApi';
import { StatusBarService } from './statusBarService';

export const StatusBarCoreModule: Module = {
    ...baseEnterpriseModule('StatusBarCoreModule'),
    beans: [StatusBarService],
    userComponents: [
        { name: 'agAggregationComponent', classImp: AggregationComp },
        { name: 'agTotalRowCountComponent', classImp: TotalRowsComp },
        { name: 'agFilteredRowCountComponent', classImp: FilteredRowsComp },
        { name: 'agTotalAndFilteredRowCountComponent', classImp: TotalAndFilteredRowsComp },
    ],
    dependsOn: [EnterpriseCoreModule, KeyboardNavigationCoreModule],
};

export const StatusBarSelectionModule: Module = {
    ...baseEnterpriseModule('StatusBarSelectionModule'),
    userComponents: [{ name: 'agSelectedRowCountComponent', classImp: SelectedRowsComp }],
    dependsOn: [StatusBarCoreModule],
};

export const StatusBarApiModule: ModuleWithApi<_StatusBarGridApi> = {
    ...baseEnterpriseModule('StatusBarApiModule'),
    apiFunctions: {
        getStatusPanel,
    },
    dependsOn: [StatusBarCoreModule],
};

export const StatusBarModule: Module = {
    ...baseEnterpriseModule(ModuleNames.StatusBarModule),
    dependsOn: [StatusBarCoreModule, StatusBarApiModule, StatusBarSelectionModule],
};
