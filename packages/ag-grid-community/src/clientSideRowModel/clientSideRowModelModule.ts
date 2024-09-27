import type { _ClientSideRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { CsrmSsrmSharedApiModule } from '../api/sharedApiModule';
import { defineCommunityModule } from '../interfaces/iModule';
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

export const ClientSideRowModelCoreModule = defineCommunityModule(`${ModuleNames.ClientSideRowModelModule}-core`, {
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, FilterStage, FlattenStage, ImmutableService, RowNodeEventThrottle],
});

export const ClientSideRowModelSortModule = defineCommunityModule(`${ModuleNames.ClientSideRowModelModule}-sort`, {
    rowModel: 'clientSide',
    beans: [SortStage],
    dependsOn: [ClientSideRowModelCoreModule, SortModule],
});

export const ClientSideRowModelApiModule = defineCommunityModule<_ClientSideRowModelGridApi<any>>(
    `${ModuleNames.ClientSideRowModelModule}-api`,
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
    dependsOn: [ClientSideRowModelCoreModule, ClientSideRowModelApiModule, ClientSideRowModelSortModule],
});
