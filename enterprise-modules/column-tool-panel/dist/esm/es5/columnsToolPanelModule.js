import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { PrimaryColsHeaderPanel } from "./columnToolPanel/primaryColsHeaderPanel";
import { PrimaryColsListPanel } from "./columnToolPanel/primaryColsListPanel";
import { ColumnToolPanel } from "./columnToolPanel/columnToolPanel";
import { PrimaryColsPanel } from "./columnToolPanel/primaryColsPanel";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";
import { ModelItemUtils } from "./columnToolPanel/modelItemUtils";
import { VERSION } from "./version";
export var ColumnsToolPanelModule = {
    version: VERSION,
    moduleName: ModuleNames.ColumnToolPanelModule,
    beans: [ModelItemUtils],
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
