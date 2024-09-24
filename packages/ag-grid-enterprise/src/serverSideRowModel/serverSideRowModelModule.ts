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

import { BlockUtils } from './blocks/blockUtils';
import { ExpandListener } from './listeners/expandListener';
import { FilterListener } from './listeners/filterListener';
import { ListenerUtils } from './listeners/listenerUtils';
import { SortListener } from './listeners/sortListener';
import { NodeManager } from './nodeManager';
import { ServerSideRowModel } from './serverSideRowModel';
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
} from './serverSideRowModelApi';
import { ServerSideExpansionService } from './services/serverSideExpansionService';
import { ServerSideSelectionService } from './services/serverSideSelectionService';
import { LazyBlockLoadingService } from './stores/lazy/lazyBlockLoadingService';
import { StoreFactory } from './stores/storeFactory';
import { StoreUtils } from './stores/storeUtils';
import { TransactionManager } from './transactionManager';
import { VERSION } from '../version';
import { EnterpriseCoreModule } from '../agGridEnterpriseModule';

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
