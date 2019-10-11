import {Grid, Module, ModuleNames} from "ag-grid-community";

export const SideBarModule: Module = {
    moduleName: ModuleNames.SideBarModule,
    beans: [ ]
};

Grid.addModule([SideBarModule]);
