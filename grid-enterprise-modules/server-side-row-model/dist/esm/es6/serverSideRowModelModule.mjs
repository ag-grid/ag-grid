import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ServerSideRowModel } from "./serverSideRowModel/serverSideRowModel.mjs";
import { StoreUtils } from "./serverSideRowModel/stores/storeUtils.mjs";
import { BlockUtils } from "./serverSideRowModel/blocks/blockUtils.mjs";
import { NodeManager } from "./serverSideRowModel/nodeManager.mjs";
import { TransactionManager } from "./serverSideRowModel/transactionManager.mjs";
import { ExpandListener } from "./serverSideRowModel/listeners/expandListener.mjs";
import { SortListener } from "./serverSideRowModel/listeners/sortListener.mjs";
import { FilterListener } from "./serverSideRowModel/listeners/filterListener.mjs";
import { StoreFactory } from "./serverSideRowModel/stores/storeFactory.mjs";
import { ListenerUtils } from "./serverSideRowModel/listeners/listenerUtils.mjs";
import { ServerSideSelectionService } from "./serverSideRowModel/services/serverSideSelectionService.mjs";
import { VERSION } from "./version.mjs";
import { ServerSideExpansionService } from "./serverSideRowModel/services/serverSideExpansionService.mjs";
export const ServerSideRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModel: 'serverSide',
    beans: [ServerSideRowModel, ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager,
        FilterListener, StoreFactory, ListenerUtils, ServerSideSelectionService, ServerSideExpansionService],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
