import {Module, ModuleNames} from "@ag-community/grid-core";
import {PrimaryColsHeaderPanel} from "./columnToolPanel/primaryColsHeaderPanel";
import {PrimaryColsListPanel} from "./columnToolPanel/primaryColsListPanel";
import {ColumnToolPanel} from "./columnToolPanel/columnToolPanel";
import {PrimaryColsPanel} from "./columnToolPanel/primaryColsPanel";

import {RowGroupingModule} from "@ag-enterprise/row-grouping";
import {SideBarModule} from "@ag-enterprise/side-bar";

export const ColumnsToolPanelModule: Module = {
    moduleName: ModuleNames.ColumnToolPanelModule,
    beans: [],
    agStackComponents: [
        {componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel},
        {componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel},
        {componentName: 'AgPrimaryCols', componentClass: PrimaryColsPanel}
    ],
    userComponents: [
        {componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel},
    ],
    dependantModules: [
        RowGroupingModule,
        SideBarModule
    ]
};

