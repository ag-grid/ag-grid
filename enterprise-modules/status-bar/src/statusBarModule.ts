import type { Module } from '@ag-grid-community/core';
import { ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';

import { AgStatusBarClass } from './statusBar/agStatusBar';
import { AgNameValueClass } from './statusBar/providedPanels/agNameValue';
import { AggregationComp } from './statusBar/providedPanels/aggregationComp';
import { FilteredRowsComp } from './statusBar/providedPanels/filteredRowsComp';
import { SelectedRowsComp } from './statusBar/providedPanels/selectedRowsComp';
import { TotalAndFilteredRowsComp } from './statusBar/providedPanels/totalAndFilteredRowsComp';
import { TotalRowsComp } from './statusBar/providedPanels/totalRowsComp';
import { getStatusPanel } from './statusBar/statusBarApi';
import { StatusBarService } from './statusBar/statusBarService';
import { VERSION } from './version';

export const StatusBarCoreModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.StatusBarModule}-core`,
    beans: [StatusBarService],
    agStackComponents: [AgStatusBarClass, AgNameValueClass],
    userComponents: [
        { name: 'agAggregationComponent', classImp: AggregationComp },
        { name: 'agSelectedRowCountComponent', classImp: SelectedRowsComp },
        { name: 'agTotalRowCountComponent', classImp: TotalRowsComp },
        { name: 'agFilteredRowCountComponent', classImp: FilteredRowsComp },
        { name: 'agTotalAndFilteredRowCountComponent', classImp: TotalAndFilteredRowsComp },
    ],
    dependantModules: [EnterpriseCoreModule],
};

export const StatusBarApiModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.StatusBarModule}-api`,
    apiFunctions: {
        getStatusPanel,
    },
    dependantModules: [StatusBarCoreModule],
};

export const StatusBarModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.StatusBarModule,
    dependantModules: [StatusBarCoreModule, StatusBarApiModule],
};
