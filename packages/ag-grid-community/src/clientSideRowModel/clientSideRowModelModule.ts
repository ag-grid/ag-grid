import type { _ClientSideRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { CsrmSsrmSharedApiModule } from '../api/sharedApiModule';
import { FilterCoreModule } from '../filter/filterModule';
import { CommunityFeaturesModule } from '../gridCoreModule';
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
    rowModel: 'clientSide',
    beans: [ClientSideNodeManager, ClientSideRowModel, FilterStage, FlattenStage, RowNodeEventThrottle],
});

export const ClientSideRowModelSortModule = defineCommunityModule('ClientSideRowModelSortModule', {
    rowModel: 'clientSide',
    beans: [SortStage],
    dependsOn: [ClientSideRowModelCoreModule, SortModule],
});

export const ClientSideRowModelFilterModule = defineCommunityModule('ClientSideRowModelFilterModule', {
    rowModel: 'clientSide',
    beans: [FilterStage],
    dependsOn: [FilterCoreModule],
});

export const ClientSideRowModelApiModule = defineCommunityModule<_ClientSideRowModelGridApi<any>>(
    'ClientSideRowModelApiModule',
    {
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
    dependsOn: [
        ClientSideRowModelCoreModule,
        ClientSideRowModelApiModule,
        ClientSideRowModelSortModule,
        ClientSideRowModelFilterModule,
        CommunityFeaturesModule,
    ],
});
