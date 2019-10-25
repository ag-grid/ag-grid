import { ModuleNames } from "@ag-community/grid-core";
import { EnterpriseCoreModule } from "@ag-enterprise/grid-core";
import { ServerSideRowModel } from "./serverSideRowModel/serverSideRowModel";
export var ServerSideRowModelModule = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: { 'serverSide': ServerSideRowModel },
    dependantModules: [
        EnterpriseCoreModule
    ]
};
