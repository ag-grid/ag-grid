import type { _ModuleWithApi, _ModuleWithoutApi, _ServerSideRowModelGridApi } from 'ag-grid-community';
import {
    CommunityFeaturesModule,
    RowNodeBlockModule,
    SortModule,
    _CsrmSsrmSharedApiModule,
    _SsrmInfiniteSharedApiModule,
} from 'ag-grid-community';

import { EnterpriseCoreModule } from '../agGridEnterpriseModule';
import { LoadingCellRendererModule, SkeletonCellRendererModule } from '../cellRenderers/enterpriseCellRendererModule';
import { baseEnterpriseModule } from '../moduleUtils';
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

export const ServerSideRowModelCoreModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ServerSideRowModelCoreModule'),
    rowModels: ['serverSide'],
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
};

export const ServerSideRowModelRowSelectionModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ServerSideRowModelRowSelectionModule'),
    rowModels: ['serverSide'],
    beans: [ServerSideSelectionService],
    dependsOn: [ServerSideRowModelCoreModule],
};

export const ServerSideRowModelRowGroupingModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ServerSideRowModelRowGroupingModule'),
    rowModels: ['serverSide'],
    beans: [ServerSideExpansionService],
    dependsOn: [ServerSideRowModelCoreModule],
};

export const ServerSideRowModelSortModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ServerSideRowModelSortModule'),
    rowModels: ['serverSide'],
    beans: [SortListener],
    dependsOn: [ServerSideRowModelCoreModule, SortModule],
};

export const ServerSideRowModelApiModule: _ModuleWithApi<_ServerSideRowModelGridApi> = {
    ...baseEnterpriseModule('ServerSideRowModelApiModule'),
    rowModels: ['serverSide'],
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
};

export const ServerSideRowModelModule: _ModuleWithoutApi = {
    ...baseEnterpriseModule('ServerSideRowModelModule'),
    rowModels: ['serverSide'],
    dependsOn: [
        ServerSideRowModelCoreModule,
        ServerSideRowModelApiModule,
        ServerSideRowModelRowSelectionModule,
        ServerSideRowModelSortModule,
        ServerSideRowModelRowGroupingModule,
        LoadingCellRendererModule,
        SkeletonCellRendererModule,
        CommunityFeaturesModule,
    ],
};
