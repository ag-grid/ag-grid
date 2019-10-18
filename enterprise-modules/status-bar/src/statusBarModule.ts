import {Module, ModuleNames} from "@ag-community/grid-core";
import {StatusBarService} from "./statusBar/statusBarService";
import {StatusBar} from "./statusBar/statusBar";
import {NameValueComp} from "./statusBar/providedPanels/nameValueComp";
import {TotalAndFilteredRowsComp} from "./statusBar/providedPanels/totalAndFilteredRowsComp";
import {FilteredRowsComp} from "./statusBar/providedPanels/filteredRowsComp";
import {TotalRowsComp} from "./statusBar/providedPanels/totalRowsComp";
import {SelectedRowsComp} from "./statusBar/providedPanels/selectedRowsComp";
import {AggregationComp} from "./statusBar/providedPanels/aggregationComp";

export const StatusBarModule: Module = {
    moduleName: ModuleNames.StatusBarModule,
    beans: [StatusBarService],
    agStackComponents: [
        {componentName: 'AgStatusBar', componentClass: StatusBar},
        {componentName: 'AgNameValue', componentClass: NameValueComp},
    ],
    userComponents: [
        {componentName: 'agAggregationComponent', componentClass: AggregationComp},
        {componentName: 'agSelectedRowCountComponent', componentClass: SelectedRowsComp},
        {componentName: 'agTotalRowCountComponent', componentClass: TotalRowsComp},
        {componentName: 'agFilteredRowCountComponent', componentClass: FilteredRowsComp},
        {componentName: 'agTotalAndFilteredRowCountComponent', componentClass: TotalAndFilteredRowsComp}
    ]
};

