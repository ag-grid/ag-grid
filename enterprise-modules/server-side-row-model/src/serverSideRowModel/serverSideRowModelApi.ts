import type {
    BeanCollection,
    IServerSideGroupSelectionState,
    IServerSideSelectionState,
    LoadSuccessParams,
    RefreshServerSideParams,
    ServerSideGroupLevelState,
    ServerSideTransaction,
    ServerSideTransactionResult,
} from '@ag-grid-community/core';
import { _logMissingRowModel, _missing } from '@ag-grid-community/core';

export function getServerSideSelectionState(
    beans: BeanCollection
): IServerSideSelectionState | IServerSideGroupSelectionState | null {
    if (_missing(beans.rowModelHelperService?.getServerSideRowModel())) {
        _logMissingRowModel('getServerSideSelectionState', 'serverSide');
        return null;
    }

    return beans.selectionService.getSelectionState() as
        | IServerSideSelectionState
        | IServerSideGroupSelectionState
        | null;
}

export function setServerSideSelectionState(
    beans: BeanCollection,
    state: IServerSideSelectionState | IServerSideGroupSelectionState
) {
    if (_missing(beans.rowModelHelperService?.getServerSideRowModel())) {
        _logMissingRowModel('setServerSideSelectionState', 'serverSide');
        return;
    }

    beans.selectionService.setSelectionState(state, 'api');
}

export function applyServerSideTransaction(
    beans: BeanCollection,
    transaction: ServerSideTransaction
): ServerSideTransactionResult | undefined {
    if (!beans.ssrmTransactionManager) {
        _logMissingRowModel('applyServerSideTransaction', 'serverSide');
        return;
    }
    return beans.ssrmTransactionManager.applyTransaction(transaction);
}

export function applyServerSideRowData(
    beans: BeanCollection,
    params: { successParams: LoadSuccessParams; route?: string[]; startRow?: number }
) {
    const startRow = params.startRow ?? 0;
    const route = params.route ?? [];
    if (startRow < 0) {
        console.warn(`AG Grid: invalid value ${params.startRow} for startRow, the value should be >= 0`);
        return;
    }

    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (serverSideRowModel) {
        serverSideRowModel.applyRowData(params.successParams, startRow, route);
    } else {
        _logMissingRowModel('applyServerSideRowData', 'serverSide');
    }
}

export function applyServerSideTransactionAsync(
    beans: BeanCollection,
    transaction: ServerSideTransaction,
    callback?: (res: ServerSideTransactionResult) => void
): void {
    if (!beans.ssrmTransactionManager) {
        _logMissingRowModel('applyServerSideTransactionAsync', 'serverSide');
        return;
    }
    return beans.ssrmTransactionManager.applyTransactionAsync(transaction, callback);
}

export function retryServerSideLoads(beans: BeanCollection): void {
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (!serverSideRowModel) {
        _logMissingRowModel('retryServerSideLoads', 'serverSide');
        return;
    }
    serverSideRowModel.retryLoads();
}

export function flushServerSideAsyncTransactions(beans: BeanCollection): void {
    if (!beans.ssrmTransactionManager) {
        _logMissingRowModel('flushServerSideAsyncTransactions', 'serverSide');
        return;
    }
    return beans.ssrmTransactionManager.flushAsyncTransactions();
}

export function refreshServerSide(beans: BeanCollection, params?: RefreshServerSideParams): void {
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (!serverSideRowModel) {
        _logMissingRowModel('refreshServerSide', 'serverSide');
        return;
    }
    serverSideRowModel.refreshStore(params);
}

export function getServerSideGroupLevelState(beans: BeanCollection): ServerSideGroupLevelState[] {
    const serverSideRowModel = beans.rowModelHelperService?.getServerSideRowModel();
    if (!serverSideRowModel) {
        _logMissingRowModel('getServerSideGroupLevelState', 'serverSide');
        return [];
    }
    return serverSideRowModel.getStoreState();
}
