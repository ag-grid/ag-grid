import type { _ServerSideRowModelGridApi } from 'ag-grid-community';
import {
    ModuleNames,
    RowModelHelperService,
    RowNodeBlockModule,
    SortModule,
    _CsrmSsrmSharedApiModule,
    _SsrmInfiniteSharedApiModule,
} from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { defineEnterpriseModule } from '../moduleUtils';
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

export const ServerSideRowModelCoreModule = defineEnterpriseModule(`${ModuleNames.ServerSideRowModelModule}-core`, {
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
    dependsOn: [EnterpriseCoreModule, RowNodeBlockModule],
});

export const ServerSideRowModelRowSelectionModule = defineEnterpriseModule(
    `${ModuleNames.ServerSideRowModelModule}-row-selection`,
    {
        rowModel: 'serverSide',
        beans: [ServerSideSelectionService],
        dependsOn: [ServerSideRowModelCoreModule],
    }
);

export const ServerSideRowModelRowGroupingModule = defineEnterpriseModule(
    `${ModuleNames.ServerSideRowModelModule}-row-grouping`,
    {
        rowModel: 'serverSide',
        beans: [ServerSideExpansionService],
        dependsOn: [ServerSideRowModelCoreModule],
    }
);

export const ServerSideRowModelSortModule = defineEnterpriseModule(`${ModuleNames.ServerSideRowModelModule}-sort`, {
    rowModel: 'serverSide',
    beans: [SortListener],
    dependsOn: [ServerSideRowModelCoreModule, SortModule],
});

export const ServerSideRowModelApiModule = defineEnterpriseModule<_ServerSideRowModelGridApi>(
    `${ModuleNames.ServerSideRowModelModule}-api`,
    {
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
        dependsOn: [ServerSideRowModelCoreModule, _CsrmSsrmSharedApiModule, _SsrmInfiniteSharedApiModule],
    }
);

export const ServerSideRowModelModule = defineEnterpriseModule(ModuleNames.ServerSideRowModelModule, {
    dependsOn: [
        ServerSideRowModelCoreModule,
        ServerSideRowModelApiModule,
        ServerSideRowModelRowSelectionModule,
        ServerSideRowModelSortModule,
        ServerSideRowModelRowGroupingModule,
    ],
});
