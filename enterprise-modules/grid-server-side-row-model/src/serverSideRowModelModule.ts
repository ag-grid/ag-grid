import {Module, ModuleNames} from "@ag-grid-community/grid-core";
import {EnterpriseCoreModule} from "@ag-grid-enterprise/grid-core";
import {ServerSideRowModel} from "./serverSideRowModel/serverSideRowModel";

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: {'serverSide': ServerSideRowModel},
    dependantModules: [
        EnterpriseCoreModule
    ]
};

