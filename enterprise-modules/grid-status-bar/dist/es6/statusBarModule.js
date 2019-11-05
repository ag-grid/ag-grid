import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { StatusBarService } from "./statusBar/statusBarService";
import { StatusBar } from "./statusBar/statusBar";
import { NameValueComp } from "./statusBar/providedPanels/nameValueComp";
import { TotalAndFilteredRowsComp } from "./statusBar/providedPanels/totalAndFilteredRowsComp";
import { FilteredRowsComp } from "./statusBar/providedPanels/filteredRowsComp";
import { TotalRowsComp } from "./statusBar/providedPanels/totalRowsComp";
import { SelectedRowsComp } from "./statusBar/providedPanels/selectedRowsComp";
import { AggregationComp } from "./statusBar/providedPanels/aggregationComp";
export var StatusBarModule = {
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
