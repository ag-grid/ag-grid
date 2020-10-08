import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ServerSideRowModel } from "./serverSideRowModel/serverSideRowModel";
import {ExpandListener} from "./serverSideRowModel/expandListener";
import {SortService} from "./serverSideRowModel/sortService";
import {StoreUtils} from "./serverSideRowModel/stores/storeUtils";
import {BlockUtils} from "./serverSideRowModel/blocks/blockUtils";

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: { 'serverSide': ServerSideRowModel },
    beans: [ExpandListener, SortService, StoreUtils, BlockUtils],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

