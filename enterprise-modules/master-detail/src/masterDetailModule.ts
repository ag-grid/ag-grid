import {Grid, Module, ModuleNames} from "ag-grid-community";
import {DetailCellRenderer} from "./masterDetail/detailCellRenderer";

export const MasterDetailModule: Module = {
    moduleName: ModuleNames.MasterDetailModule,
    beans: [ ],
    userComponents: [
        {componentName: 'agDetailCellRenderer', componentClass: DetailCellRenderer}
    ]
};

Grid.addModule([MasterDetailModule]);
