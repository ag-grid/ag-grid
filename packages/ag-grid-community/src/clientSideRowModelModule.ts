import { _defineModule, _ClientSideRowModelGridApi, ModuleNames, RowModelHelperService, SortModule, _CsrmSsrmSharedApiModule } from './main';

import { ClientSideRowModel } from './clientSideRowModel/clientSideRowModel';
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
} from './clientSideRowModel/clientSideRowModelApi';
import { FilterStage } from './clientSideRowModel/filterStage';
import { FlattenStage } from './clientSideRowModel/flattenStage';
import { ImmutableService } from './clientSideRowModel/immutableService';
import { SortStage } from './clientSideRowModel/sortStage';
import { VERSION } from './version';

export const ClientSideRowModelCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ClientSideRowModelModule}-core`,
    rowModel: 'clientSide',
    beans: [ClientSideRowModel, FilterStage, FlattenStage, ImmutableService],
});

export const ClientSideRowModelSortModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ClientSideRowModelModule}-sort`,
    rowModel: 'clientSide',
    beans: [SortStage],
    dependantModules: [ClientSideRowModelCoreModule, SortModule],
});

export const ClientSideRowModelApiModule = _defineModule<_ClientSideRowModelGridApi<any>>({
    version: VERSION,
    moduleName: `${ModuleNames.ClientSideRowModelModule}-api`,
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
    dependantModules: [ClientSideRowModelCoreModule, _CsrmSsrmSharedApiModule],
});

export const ClientSideRowModelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    dependantModules: [ClientSideRowModelCoreModule, ClientSideRowModelApiModule, ClientSideRowModelSortModule],
});
