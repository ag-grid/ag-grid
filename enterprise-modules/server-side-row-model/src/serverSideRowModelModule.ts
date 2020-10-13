import { Module, ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ServerSideRowModel } from "./serverSideRowModel/serverSideRowModel";
import {ExpandListener} from "./serverSideRowModel/expandListener";
import {StoreUtils} from "./serverSideRowModel/stores/storeUtils";
import {BlockUtils} from "./serverSideRowModel/blocks/blockUtils";
import {SortListener} from "./serverSideRowModel/sortListener";
import {NodeManager} from "./serverSideRowModel/nodeManager";
import {TransactionManager} from "./serverSideRowModel/transactionManager";

export const ServerSideRowModelModule: Module = {
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModels: { 'serverSide': ServerSideRowModel },
    beans: [ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager],
    dependantModules: [
        EnterpriseCoreModule
    ]
};

