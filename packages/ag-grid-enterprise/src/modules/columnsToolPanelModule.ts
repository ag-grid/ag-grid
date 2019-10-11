import {Grid, Module, ModuleNames} from "ag-grid-community";
import {PrimaryColsHeaderPanel} from "./columnToolPanel/primaryColsHeaderPanel";
import {PrimaryColsListPanel} from "./columnToolPanel/primaryColsListPanel";
import {ColumnToolPanel} from "./columnToolPanel/columnToolPanel";
import {PrimaryColsPanel} from "./columnToolPanel/primaryColsPanel";

export const ColumnToolPanelModule: Module = {
    moduleName: ModuleNames.ColumnToolPanelModule,
    beans: [],
    agStackComponents: [
        {componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel},
        {componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel},
        {componentName: 'AgPrimaryCols', componentClass: PrimaryColsPanel}
    ],
    userComponents: [
        {componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel},
    ]
};

Grid.addModule([ColumnToolPanelModule]);
