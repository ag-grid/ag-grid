import {Module, ModuleNames, ModuleRegistry} from "ag-grid-community";
import {DetailCellRenderer} from "./masterDetail/detailCellRenderer";

export const MasterDetailModule: Module = {
    moduleName: ModuleNames.MasterDetailModule,
    beans: [ ],
    userComponents: [
        {componentName: 'agDetailCellRenderer', componentClass: DetailCellRenderer}
    ]
};

ModuleRegistry.register(MasterDetailModule);
