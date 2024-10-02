import type { _ClientSideRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { CsrmSsrmSharedApiModule } from '../api/sharedApiModule';
import { CommunityFeaturesModule } from '../communityFeaturesModule';
import { FilterCoreModule } from '../filter/filterModule';
import { defineCommunityModule } from '../interfaces/iModule';
import { ModuleNames } from '../modules/moduleNames';
import { SortModule } from '../sort/sortModule';
import { ClientSideNodeManager } from './clientSideNodeManager';
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
import { RowNodeEventThrottle } from './rowNodeEventThrottle';
import { SortStage } from './sortStage';

export const ClientSideRowModelCoreModule = defineCommunityModule('ClientSideRowModelCoreModule', {
    rowModels: ['clientSide'],
    beans: [ClientSideNodeManager, ClientSideRowModel, FlattenStage, RowNodeEventThrottle],
});

export const ClientSideRowModelSortModule = defineCommunityModule('ClientSideRowModelSortModule', {
    rowModels: ['clientSide'],
    beans: [SortStage],
    dependsOn: [ClientSideRowModelCoreModule, SortModule],
});

export const ClientSideRowModelFilterModule = defineCommunityModule('ClientSideRowModelFilterModule', {
    rowModels: ['clientSide'],
    beans: [FilterStage],
    dependsOn: [FilterCoreModule],
});

export const ClientSideRowModelApiModule = defineCommunityModule<_ClientSideRowModelGridApi<any>>(
    'ClientSideRowModelApiModule',
    {
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
    }
);

export const ClientSideRowModelModule = defineCommunityModule(ModuleNames.ClientSideRowModelModule, {
    rowModels: ['clientSide'],
    dependsOn: [
        ClientSideRowModelCoreModule,
        ClientSideRowModelApiModule,
        ClientSideRowModelSortModule,
        ClientSideRowModelFilterModule,
        CommunityFeaturesModule,
    ],
});
