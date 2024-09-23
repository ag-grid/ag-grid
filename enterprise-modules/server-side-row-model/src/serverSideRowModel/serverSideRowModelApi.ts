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
import { _warnOnce } from '@ag-grid-community/core';

export function getServerSideSelectionState(
    beans: BeanCollection
): IServerSideSelectionState | IServerSideGroupSelectionState | null {
    return (beans.selectionService?.getSelectionState() ?? null) as
        | IServerSideSelectionState
        | IServerSideGroupSelectionState
        | null;
}

export function setServerSideSelectionState(
    beans: BeanCollection,
    state: IServerSideSelectionState | IServerSideGroupSelectionState
) {
    beans.selectionService?.setSelectionState(state, 'api');
}

export function applyServerSideTransaction(
    beans: BeanCollection,
    transaction: ServerSideTransaction
): ServerSideTransactionResult | undefined {
    return beans.ssrmTransactionManager?.applyTransaction(transaction);
}

export function applyServerSideRowData(
    beans: BeanCollection,
    params: { successParams: LoadSuccessParams; route?: string[]; startRow?: number }
): void {
    const startRow = params.startRow ?? 0;
    const route = params.route ?? [];
    if (startRow < 0) {
        _warnOnce(`invalid value ${params.startRow} for startRow, the value should be >= 0`);
        return;
    }

    beans.rowModelHelperService?.getServerSideRowModel()?.applyRowData(params.successParams, startRow, route);
}

export function applyServerSideTransactionAsync(
    beans: BeanCollection,
    transaction: ServerSideTransaction,
    callback?: (res: ServerSideTransactionResult) => void
): void {
    return beans.ssrmTransactionManager?.applyTransactionAsync(transaction, callback);
}

export function retryServerSideLoads(beans: BeanCollection): void {
    beans.rowModelHelperService?.getServerSideRowModel()?.retryLoads();
}

export function flushServerSideAsyncTransactions(beans: BeanCollection): void {
    return beans.ssrmTransactionManager?.flushAsyncTransactions();
}

export function refreshServerSide(beans: BeanCollection, params?: RefreshServerSideParams): void {
    beans.rowModelHelperService?.getServerSideRowModel()?.refreshStore(params);
}

export function getServerSideGroupLevelState(beans: BeanCollection): ServerSideGroupLevelState[] {
    return beans.rowModelHelperService?.getServerSideRowModel()?.getStoreState() ?? [];
}
