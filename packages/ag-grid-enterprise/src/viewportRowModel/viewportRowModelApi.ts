import type {
    BeanCollection,
    IServerSideGroupSelectionState,
    IServerSideSelectionState,
    LoadSuccessParams,
    ServerSideTransaction,
    ServerSideTransactionResult,
} from 'ag-grid-community';
import { _getServerSideRowModel, _warn } from 'ag-grid-community';
import { _getViewportRowModel } from 'ag-grid-community';

export function getServerSideSelectionState(
    beans: BeanCollection
): IServerSideSelectionState | IServerSideGroupSelectionState | null {
    return (beans.selectionSvc?.getSelectionState() ?? null) as
        | IServerSideSelectionState
        | IServerSideGroupSelectionState
        | null;
}

export function setServerSideSelectionState(
    beans: BeanCollection,
    state: IServerSideSelectionState | IServerSideGroupSelectionState
) {
    beans.selectionSvc?.setSelectionState(state, 'api');
}

export function applyServerSideTransaction<TData = any>(
    beans: BeanCollection,
    transaction: ServerSideTransaction<TData>
): ServerSideTransactionResult<TData> | undefined {
    return beans.ssrmTxnManager?.applyTransaction(transaction);
}

export function applyServerSideRowData<TData = any>(
    beans: BeanCollection,
    params: { successParams: LoadSuccessParams<TData>; route?: string[]; startRow?: number }
): void {
    const startRow = params.startRow ?? 0;
    const route = params.route ?? [];
    if (startRow < 0) {
        _warn(189, { startRow });
        return;
    }

    _getServerSideRowModel(beans)?.applyRowData(params.successParams, startRow, route);
}

export function applyServerSideTransactionAsync<TData = any>(
    beans: BeanCollection,
    transaction: ServerSideTransaction<TData>,
    callback?: (res: ServerSideTransactionResult<TData>) => void
): void {
    return beans.ssrmTxnManager?.applyTransactionAsync(transaction, callback);
}

export function retryServerSideLoads(beans: BeanCollection): void {
    _getServerSideRowModel(beans)?.retryLoads();
}

export function resetRowHeights(beans: BeanCollection): void {
    console.log('resetRowHeights called');
    _getViewportRowModel(beans)?.resetRowHeights();
}
