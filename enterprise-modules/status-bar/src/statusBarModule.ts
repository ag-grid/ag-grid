import type { _StatusBarGridApi } from '@ag-grid-community/core';
import { ModuleNames, RowSelectionCoreModule, _defineModule } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { AggregationComp } from './statusBar/providedPanels/aggregationComp';
import { FilteredRowsComp } from './statusBar/providedPanels/filteredRowsComp';
import { SelectedRowsComp } from './statusBar/providedPanels/selectedRowsComp';
import { TotalAndFilteredRowsComp } from './statusBar/providedPanels/totalAndFilteredRowsComp';
import { TotalRowsComp } from './statusBar/providedPanels/totalRowsComp';
import { getStatusPanel } from './statusBar/statusBarApi';
import { StatusBarService } from './statusBar/statusBarService';
import { VERSION } from './version';

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
