import {Module, ModuleNames, ModuleRegistry} from "ag-grid-community";
import {ServerSideRowModel} from "./serverSideRowModel/serverSideRowModel";

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: {'serverSide': ServerSideRowModel}
};

ModuleRegistry.register(ServerSideRowModelModule);
