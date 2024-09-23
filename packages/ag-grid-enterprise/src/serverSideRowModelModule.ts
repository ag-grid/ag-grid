import type { _ServerSideRowModelGridApi } from 'ag-grid-community';
import {
    ModuleNames,
    RowModelHelperService,
    SortModule,
    _CsrmSsrmSharedApiModule,
    _RowNodeBlockModule,
    _SsrmInfiniteSharedApiModule,
    _defineModule,
} from 'ag-grid-community';
import { EnterpriseCoreModule } from './main';

import { BlockUtils } from './serverSideRowModel/blocks/blockUtils';
import { ExpandListener } from './serverSideRowModel/listeners/expandListener';
import { FilterListener } from './serverSideRowModel/listeners/filterListener';
import { ListenerUtils } from './serverSideRowModel/listeners/listenerUtils';
import { SortListener } from './serverSideRowModel/listeners/sortListener';
import { NodeManager } from './serverSideRowModel/nodeManager';
import { ServerSideRowModel } from './serverSideRowModel/serverSideRowModel';
import {
    applyServerSideRowData,
    applyServerSideTransaction,
    applyServerSideTransactionAsync,
    flushServerSideAsyncTransactions,
    getServerSideGroupLevelState,
    getServerSideSelectionState,
    refreshServerSide,
    retryServerSideLoads,
    setServerSideSelectionState,
} from './serverSideRowModel/serverSideRowModelApi';
import { ServerSideExpansionService } from './serverSideRowModel/services/serverSideExpansionService';
import { ServerSideSelectionService } from './serverSideRowModel/services/serverSideSelectionService';
import { LazyBlockLoadingService } from './serverSideRowModel/stores/lazy/lazyBlockLoadingService';
import { StoreFactory } from './serverSideRowModel/stores/storeFactory';
import { StoreUtils } from './serverSideRowModel/stores/storeUtils';
import { TransactionManager } from './serverSideRowModel/transactionManager';
import { VERSION } from './version';

export const ServerSideRowModelCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ServerSideRowModelModule}-core`,
    rowModel: 'serverSide',
    beans: [
        ServerSideRowModel,
        ExpandListener,
        StoreUtils,
        BlockUtils,
        NodeManager,
        TransactionManager,
        FilterListener,
        StoreFactory,
        ListenerUtils,
        ServerSideSelectionService,
        LazyBlockLoadingService,
    ],
    dependantModules: [EnterpriseCoreModule, _RowNodeBlockModule],
});

export const ServerSideRowModelRowSelectionModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ServerSideRowModelModule}-row-selection`,
    rowModel: 'serverSide',
    beans: [ServerSideSelectionService],
    dependantModules: [ServerSideRowModelCoreModule],
});

export const ServerSideRowModelRowGroupingModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ServerSideRowModelModule}-row-grouping`,
    rowModel: 'serverSide',
    beans: [ServerSideExpansionService],
    dependantModules: [ServerSideRowModelCoreModule],
});

export const ServerSideRowModelSortModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ServerSideRowModelModule}-sort`,
    rowModel: 'serverSide',
    beans: [SortListener],
    dependantModules: [ServerSideRowModelCoreModule, SortModule],
});

export const ServerSideRowModelApiModule = _defineModule<_ServerSideRowModelGridApi>({
    version: VERSION,
    moduleName: `${ModuleNames.ServerSideRowModelModule}-api`,
    beans: [RowModelHelperService],
    apiFunctions: {
        getServerSideSelectionState,
        setServerSideSelectionState,
        applyServerSideTransaction,
        applyServerSideTransactionAsync,
        applyServerSideRowData,
        retryServerSideLoads,
        flushServerSideAsyncTransactions,
        refreshServerSide,
        getServerSideGroupLevelState,
    },
    dependantModules: [ServerSideRowModelCoreModule, _CsrmSsrmSharedApiModule, _SsrmInfiniteSharedApiModule],
});

export const ServerSideRowModelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ServerSideRowModelModule,
    dependantModules: [
        ServerSideRowModelCoreModule,
        ServerSideRowModelApiModule,
        ServerSideRowModelRowSelectionModule,
        ServerSideRowModelSortModule,
        ServerSideRowModelRowGroupingModule,
    ],
});
