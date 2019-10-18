import {Module, ModuleNames} from "@ag-community/grid-core";
import {ServerSideRowModel} from "./serverSideRowModel/serverSideRowModel";

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: {'serverSide': ServerSideRowModel}
};

