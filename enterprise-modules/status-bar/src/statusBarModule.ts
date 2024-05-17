import { Module, ModuleNames } from '@ag-grid-community/core';
import { EnterpriseCoreModule } from '@ag-grid-enterprise/core';
import { StatusBarService } from './statusBar/statusBarService';
import { AgStatusBar } from './statusBar/agStatusBar';
import { AgNameValue } from './statusBar/providedPanels/agNameValue';
import { TotalAndFilteredRowsComp } from './statusBar/providedPanels/totalAndFilteredRowsComp';
import { FilteredRowsComp } from './statusBar/providedPanels/filteredRowsComp';
import { TotalRowsComp } from './statusBar/providedPanels/totalRowsComp';
import { SelectedRowsComp } from './statusBar/providedPanels/selectedRowsComp';
import { AggregationComp } from './statusBar/providedPanels/aggregationComp';
import { VERSION } from './version';

export const StatusBarModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.StatusBarModule,
    beans: [StatusBarService],
    agStackComponents: [AgStatusBar, AgNameValue],
    userComponents: [
        { componentName: 'agAggregationComponent', componentClass: AggregationComp },
        { componentName: 'agSelectedRowCountComponent', componentClass: SelectedRowsComp },
        { componentName: 'agTotalRowCountComponent', componentClass: TotalRowsComp },
        { componentName: 'agFilteredRowCountComponent', componentClass: FilteredRowsComp },
        { componentName: 'agTotalAndFilteredRowCountComponent', componentClass: TotalAndFilteredRowsComp },
    ],
    dependantModules: [EnterpriseCoreModule],
};
