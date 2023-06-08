import { ModuleNames } from "@ag-grid-community/core";
import { EnterpriseCoreModule } from "@ag-grid-enterprise/core";
import { ServerSideRowModel } from "./serverSideRowModel/serverSideRowModel";
import { StoreUtils } from "./serverSideRowModel/stores/storeUtils";
import { BlockUtils } from "./serverSideRowModel/blocks/blockUtils";
import { NodeManager } from "./serverSideRowModel/nodeManager";
import { TransactionManager } from "./serverSideRowModel/transactionManager";
import { ExpandListener } from "./serverSideRowModel/listeners/expandListener";
import { SortListener } from "./serverSideRowModel/listeners/sortListener";
import { FilterListener } from "./serverSideRowModel/listeners/filterListener";
import { StoreFactory } from "./serverSideRowModel/stores/storeFactory";
import { ListenerUtils } from "./serverSideRowModel/listeners/listenerUtils";
import { ServerSideSelectionService } from "./serverSideRowModel/services/serverSideSelectionService";
import { VERSION } from "./version";
export const ServerSideRowModelModule = {
    version: VERSION,
    moduleName: ModuleNames.ServerSideRowModelModule,
    rowModel: 'serverSide',
    beans: [ServerSideRowModel, ExpandListener, SortListener, StoreUtils, BlockUtils, NodeManager, TransactionManager,
        FilterListener, StoreFactory, ListenerUtils, ServerSideSelectionService],
    dependantModules: [
        EnterpriseCoreModule
    ]
};
