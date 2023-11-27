import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { StatusBarService } from "./statusBar/statusBarService.mjs";
import { StatusBar } from "./statusBar/statusBar.mjs";
import { NameValueComp } from "./statusBar/providedPanels/nameValueComp.mjs";
import { TotalAndFilteredRowsComp } from "./statusBar/providedPanels/totalAndFilteredRowsComp.mjs";
import { FilteredRowsComp } from "./statusBar/providedPanels/filteredRowsComp.mjs";
import { TotalRowsComp } from "./statusBar/providedPanels/totalRowsComp.mjs";
import { SelectedRowsComp } from "./statusBar/providedPanels/selectedRowsComp.mjs";
import { AggregationComp } from "./statusBar/providedPanels/aggregationComp.mjs";
import { VERSION } from "./version.mjs";
export const StatusBarModule = {
    version: VERSION,
    moduleName: ModuleNames.StatusBarModule,
    beans: [StatusBarService],
    agStackComponents: [
        { componentName: 'AgStatusBar', componentClass: StatusBar },
        { componentName: 'AgNameValue', componentClass: NameValueComp },
    ],
    userComponents: [
        { componentName: 'agAggregationComponent', componentClass: AggregationComp },
        { componentName: 'agSelectedRowCountComponent', componentClass: SelectedRowsComp },
        { componentName: 'agTotalRowCountComponent', componentClass: TotalRowsComp },
        { componentName: 'agFilteredRowCountComponent', componentClass: FilteredRowsComp },
        { componentName: 'agTotalAndFilteredRowCountComponent', componentClass: TotalAndFilteredRowsComp }
    ],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
