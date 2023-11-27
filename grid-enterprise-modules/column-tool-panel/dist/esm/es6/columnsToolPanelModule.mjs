import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { PrimaryColsHeaderPanel } from "./columnToolPanel/primaryColsHeaderPanel.mjs";
import { PrimaryColsListPanel } from "./columnToolPanel/primaryColsListPanel.mjs";
import { ColumnToolPanel } from "./columnToolPanel/columnToolPanel.mjs";
import { PrimaryColsPanel } from "./columnToolPanel/primaryColsPanel.mjs";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { SideBarModule } from "@ag-grid-enterprise/side-bar";
import { ModelItemUtils } from "./columnToolPanel/modelItemUtils.mjs";
import { VERSION } from "./version.mjs";
export const ColumnsToolPanelModule = {
    version: VERSION,
    moduleName: ModuleNames.ColumnsToolPanelModule,
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
