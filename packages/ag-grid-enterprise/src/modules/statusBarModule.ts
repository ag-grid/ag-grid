import {Grid, Module, ModuleNames} from "ag-grid-community";

export const StatusBarModule: Module = {
    moduleName: ModuleNames.StatusBarModule,
    beans: [ ]
};

Grid.addModule([StatusBarModule]);
