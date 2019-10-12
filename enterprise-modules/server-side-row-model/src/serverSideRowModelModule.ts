import {Grid, Module, ModuleNames} from "ag-grid-community";
import {ServerSideRowModel} from "./serverSideRowModel/serverSideRowModel";

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule
};

Grid.addModule([ServerSideRowModelModule]);
Grid.addRowModelClass('serverSide', ServerSideRowModel);

