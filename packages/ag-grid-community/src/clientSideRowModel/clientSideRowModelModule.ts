import type { _ClientSideRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { CsrmSsrmSharedApiModule } from '../api/sharedApiModule';
import { FilterCoreModule } from '../filter/filterModule';
import { CommunityFeaturesModule } from '../gridCoreModule';
import { baseCommunityModule } from '../interfaces/iModule';
import type { Module, ModuleWithApi } from '../interfaces/iModule';
import { ModuleNames } from '../modules/moduleNames';
import { SortModule } from '../sort/sortModule';
import { ClientSideRowModel } from './clientSideRowModel';
import {
    applyTransaction,
    applyTransactionAsync,
    flushAsyncTransactions,
    forEachLeafNode,
    forEachNodeAfterFilter,
    forEachNodeAfterFilterAndSort,
    getBestCostNodeSelection,
    isRowDataEmpty,
    onGroupExpandedOrCollapsed,
    refreshClientSideRowModel,
    resetRowHeights,
} from './clientSideRowModelApi';
import { FilterStage } from './filterStage';
import { FlattenStage } from './flattenStage';
import { ImmutableService } from './immutableService';
import { RowNodeEventThrottle } from './rowNodeEventThrottle';
import { SortStage } from './sortStage';

export const ClientSideRowModelCoreModule: Module = {
    ...baseCommunityModule('ClientSideRowModelCoreModule'),
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, FlattenStage, ImmutableService, RowNodeEventThrottle],
};

export const ClientSideRowModelSortModule: Module = {
    ...baseCommunityModule('ClientSideRowModelSortModule'),
    rowModel: 'clientSide',
    beans: [SortStage],
    dependsOn: [ClientSideRowModelCoreModule, SortModule],
};

export const ClientSideRowModelFilterModule: Module = {
    ...baseCommunityModule('ClientSideRowModelFilterModule'),
    rowModel: 'clientSide',
    beans: [FilterStage],
    dependsOn: [FilterCoreModule],
};

export const ClientSideRowModelApiModule: ModuleWithApi<_ClientSideRowModelGridApi<any>> = {
    ...baseCommunityModule('ClientSideRowModelApiModule'),
    beans: [RowModelHelperService],
    apiFunctions: {
        onGroupExpandedOrCollapsed,
        refreshClientSideRowModel,
        isRowDataEmpty,
        forEachLeafNode,
        forEachNodeAfterFilter,
        forEachNodeAfterFilterAndSort,
        resetRowHeights,
        applyTransaction,
        applyTransactionAsync,
        flushAsyncTransactions,
        getBestCostNodeSelection,
    },
    dependsOn: [ClientSideRowModelCoreModule, CsrmSsrmSharedApiModule],
};

export const ClientSideRowModelModule: Module = {
    ...baseCommunityModule(ModuleNames.ClientSideRowModelModule),
    dependsOn: [
        ClientSideRowModelCoreModule,
        ClientSideRowModelApiModule,
        ClientSideRowModelSortModule,
        ClientSideRowModelFilterModule,
        CommunityFeaturesModule,
    ],
};
