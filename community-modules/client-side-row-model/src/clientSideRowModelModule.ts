import type { Module } from '@ag-grid-community/core';
import { ModuleNames, RowModelHelperService, _CsrmSsrmSharedApiModule } from '@ag-grid-community/core';

import { ClientSideRowModel } from './clientSideRowModel/clientSideRowModel';
import {
    applyTransaction,
    applyTransactionAsync,
    flushAsyncTransactions,
    forEachLeafNode,
    forEachNodeAfterFilter,
    forEachNodeAfterFilterAndSort,
    getBestCostNodeSelection,
    onGroupExpandedOrCollapsed,
    refreshClientSideRowModel,
    resetRowHeights,
} from './clientSideRowModel/clientSideRowModelApi';
import { FilterStage } from './clientSideRowModel/filterStage';
import { FlattenStage } from './clientSideRowModel/flattenStage';
import { ImmutableService } from './clientSideRowModel/immutableService';
import { SortService } from './clientSideRowModel/sortService';
import { SortStage } from './clientSideRowModel/sortStage';
import { VERSION } from './version';

export const ClientSideRowModelCoreModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.ClientSideRowModelModule}-core`,
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, FilterStage, SortStage, FlattenStage, SortService, ImmutableService],
};

export const ClientSideRowModelApiModule: Module = {
    version: VERSION,
    moduleName: `${ModuleNames.ClientSideRowModelModule}-api`,
    beans: [RowModelHelperService],
    apiFunctions: {
        onGroupExpandedOrCollapsed,
        refreshClientSideRowModel,
        forEachLeafNode,
        forEachNodeAfterFilter,
        forEachNodeAfterFilterAndSort,
        resetRowHeights,
        applyTransaction,
        applyTransactionAsync,
        flushAsyncTransactions,
        getBestCostNodeSelection,
    },
    dependantModules: [ClientSideRowModelCoreModule, _CsrmSsrmSharedApiModule],
};

export const ClientSideRowModelModule: Module = {
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    dependantModules: [ClientSideRowModelCoreModule, ClientSideRowModelApiModule],
};
