import {Grid, Module, ModuleNames} from "ag-grid-community";
import {PrimaryColsHeaderPanel} from "./columnToolPanel/primaryColsHeaderPanel";
import {PrimaryColsListPanel} from "./columnToolPanel/primaryColsListPanel";
import {ColumnToolPanel} from "./columnToolPanel/columnToolPanel";

export const ColumnToolPanelModule: Module = {
    moduleName: ModuleNames.ColumnToolPanelModule,
    beans: [],
    agStackComponents: [
        {componentName: 'AgPrimaryColsHeader', componentClass: PrimaryColsHeaderPanel},
        {componentName: 'AgPrimaryColsList', componentClass: PrimaryColsListPanel},
    ],
    userComponents: [
        {componentName: 'agColumnsToolPanel', componentClass: ColumnToolPanel},
    ]
};

Grid.addModule([ColumnToolPanelModule]);
