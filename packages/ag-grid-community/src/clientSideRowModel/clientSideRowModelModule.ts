import type { _ClientSideRowModelGridApi } from '../api/gridApi';
import { RowModelHelperService } from '../api/rowModelHelperService';
import { CsrmSsrmSharedApiModule } from '../api/sharedApiModule';
import { _defineModule } from '../interfaces/iModule';
import { ModuleNames } from '../modules/moduleNames';
import { SortModule } from '../sort/sortModule';
import { VERSION } from '../version';
import { ClientSideNodeManager } from './clientSideNodeManager/clientSideNodeManager';
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
import { SortStage } from './sortStage';

export const ClientSideRowModelCoreModule = _defineModule({
    version: VERSION,
    moduleName: `${ModuleNames.ClientSideRowModelModule}-core`,
    rowModel: 'clientSide',
    beans: [ClientSideNodeManager, ClientSideRowModel, FilterStage, FlattenStage],
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
    dependantModules: [ClientSideRowModelCoreModule, CsrmSsrmSharedApiModule],
});

export const ClientSideRowModelModule = _defineModule({
    version: VERSION,
    moduleName: ModuleNames.ClientSideRowModelModule,
    dependantModules: [ClientSideRowModelCoreModule, ClientSideRowModelApiModule, ClientSideRowModelSortModule],
});
