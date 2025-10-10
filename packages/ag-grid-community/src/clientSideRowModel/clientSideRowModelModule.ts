import type { _ClientSideRowModelGridApi } from '../api/gridApi';
import { onRowHeightChanged, resetRowHeights } from '../api/rowModelSharedApi';
import { CsrmSsrmSharedApiModule, RowModelSharedApiModule } from '../api/sharedApiModule';
import type { _ModuleWithApi, _ModuleWithoutApi } from '../interfaces/iModule';
import { SortModule } from '../sort/sortModule';
import { VERSION } from '../version';
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
} from './clientSideRowModelApi';
import { SortStage } from './sortStage';

/**
 * @feature Client-Side Row Model
 */
export const ClientSideRowModelModule: _ModuleWithoutApi = {
    moduleName: 'ClientSideRowModel',
    version: VERSION,
    rowModels: ['clientSide'],
    beans: [ClientSideRowModel, SortStage],
    dependsOn: [SortModule],
};

/**
 * @feature Client-Side Row Model
 */
export const ClientSideRowModelApiModule: _ModuleWithApi<_ClientSideRowModelGridApi<any>> = {
    moduleName: 'ClientSideRowModelApi',
    version: VERSION,
    apiFunctions: {
        onGroupExpandedOrCollapsed,
        refreshClientSideRowModel,
        isRowDataEmpty,
        forEachLeafNode,
        forEachNodeAfterFilter,
        forEachNodeAfterFilterAndSort,
        applyTransaction,
        applyTransactionAsync,
        flushAsyncTransactions,
        getBestCostNodeSelection,
        resetRowHeights,
        onRowHeightChanged,
    },
    dependsOn: [CsrmSsrmSharedApiModule, RowModelSharedApiModule],
};
