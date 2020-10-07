import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ServerSideRowModel } from "./serverSideRowModel/serverSideRowModel";
import {ExpandListener} from "./serverSideRowModel/expandListener";
import {SortService} from "./serverSideRowModel/sortService";
import {CacheUtils} from "./serverSideRowModel/cacheUtils";
import {BlockUtils} from "./serverSideRowModel/blockUtils";

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: { 'serverSide': ServerSideRowModel },
    beans: [ExpandListener, SortService, CacheUtils, BlockUtils],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

