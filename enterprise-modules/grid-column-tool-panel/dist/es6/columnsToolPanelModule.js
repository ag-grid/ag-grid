import { ModuleNames } from "@ag-grid-community/grid-core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/grid-core";
import { PrimaryColsHeaderPanel } from "./columnToolPanel/primaryColsHeaderPanel";
import { PrimaryColsListPanel } from "./columnToolPanel/primaryColsListPanel";
import { ColumnToolPanel } from "./columnToolPanel/columnToolPanel";
import { PrimaryColsPanel } from "./columnToolPanel/primaryColsPanel";
import { RowGroupingModule } from "@ag-grid-enterprise/grid-row-grouping";
import { SideBarModule } from "@ag-grid-enterprise/grid-side-bar";
export var ColumnsToolPanelModule = {
    moduleName: ModuleNames.ColumnToolPanelModule,
    beans: [],
    agStackComponents: [
        { componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel },
        { componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel },
        { componentName: 'AgPrimaryCols', componentClass: PrimaryColsPanel }
    ],
    userComponents: [
        { componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel },
    ],
    dependantModules: [
        EnterpriseCoreModule,
        RowGroupingModule,
        SideBarModule
    ]
};
