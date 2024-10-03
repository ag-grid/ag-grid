import type { _ClientSideRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { CsrmSsrmSharedApiModule } from '../api/sharedApiModule';
import { CommunityFeaturesModule } from '../communityFeaturesModule';
import { FilterCoreModule } from '../filter/filterModule';
import { baseCommunityModule } from '../interfaces/iModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
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

export const ClientSideRowModelCoreModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ClientSideRowModelCoreModule'),
    rowModels: ['clientSide'],
    beans: [ClientSideRowModel, FlattenStage, ImmutableService, RowNodeEventThrottle],
};

export const ClientSideRowModelSortModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ClientSideRowModelSortModule'),
    rowModels: ['clientSide'],
    beans: [SortStage],
    dependsOn: [ClientSideRowModelCoreModule, SortModule],
};

export const ClientSideRowModelFilterModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ClientSideRowModelFilterModule'),
    rowModels: ['clientSide'],
    beans: [FilterStage],
    dependsOn: [FilterCoreModule],
};

export const ClientSideRowModelApiModule: _ModuleWithApi<_ClientSideRowModelGridApi<any>> = {
    ...baseCommunityModule('ClientSideRowModelApiModule'),
    rowModels: ['clientSide'],
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

export const ClientSideRowModelModule: _ModuleWithoutApi = {
    ...baseCommunityModule('ClientSideRowModelModule'),
    rowModels: ['clientSide'],
    dependsOn: [
        ClientSideRowModelCoreModule,
        ClientSideRowModelApiModule,
        ClientSideRowModelSortModule,
        ClientSideRowModelFilterModule,
        CommunityFeaturesModule,
    ],
};
