import type { _StatusBarGridApi } from 'ag-grid-community';
import { ModuleNames, RowSelectionCoreModule, _defineModule } from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { VERSION } from '../version';
import { AggregationComp } from './providedPanels/aggregationComp';
import { FilteredRowsComp } from './providedPanels/filteredRowsComp';
import { SelectedRowsComp } from './providedPanels/selectedRowsComp';
import { TotalAndFilteredRowsComp } from './providedPanels/totalAndFilteredRowsComp';
import { TotalRowsComp } from './providedPanels/totalRowsComp';
import { getStatusPanel } from './statusBarApi';
import { StatusBarService } from './statusBarService';

export const StatusBarCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.StatusBarModule}-core`,
    beans: [StatusBarService],
    userComponents: [
        { name: 'agAggregationComponent', classImp: AggregationComp },
        { name: 'agTotalRowCountComponent', classImp: TotalRowsComp },
        { name: 'agFilteredRowCountComponent', classImp: FilteredRowsComp },
        { name: 'agTotalAndFilteredRowCountComponent', classImp: TotalAndFilteredRowsComp },
    ],
    dependantModules: [EnterpriseCoreModule],
});

export const StatusBarSelectionModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.StatusBarModule}-selection`,
    userComponents: [{ name: 'agSelectedRowCountComponent', classImp: SelectedRowsComp }],
    dependantModules: [StatusBarCoreModule, RowSelectionCoreModule],
});

export const StatusBarApiModule = _defineModule<_StatusBarGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.StatusBarModule}-api`,
    apiFunctions: {
        getStatusPanel,
    },
    dependantModules: [StatusBarCoreModule],
});

export const StatusBarModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.StatusBarModule,
    dependantModules: [StatusBarCoreModule, StatusBarApiModule, StatusBarSelectionModule],
});
