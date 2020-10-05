import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ServerSideRowModel } from "./serverSideRowModel/serverSideRowModel";
import {GroupExpandListener} from "./serverSideRowModel/groupExpandListener";

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: { 'serverSide': ServerSideRowModel },
    beans: [GroupExpandListener],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

