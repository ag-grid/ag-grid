import type {
    BeanCollection,
    ClientSideRowModelStep,
    IRowNode,
    RowDataTransaction,
    RowNodeTransaction,
} from '@ag-grid-community/core';
import { _warnOnce } from '@ag-grid-community/core';

export function onGroupExpandedOrCollapsed(beans: BeanCollection): void {
    beans.expansionService.onGroupExpandedOrCollapsed();
}

export function refreshClientSideRowModel(beans: BeanCollection, step?: ClientSideRowModelStep): void {
    beans.rowModelHelperService?.getClientSideRowModel()?.refreshModel(step);
}

export function isRowDataEmpty(beans: BeanCollection): boolean {
    return beans.rowModelHelperService?.getClientSideRowModel()?.isEmpty() ?? true;
}

export function forEachLeafNode<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>) => void
): void {
    beans.rowModelHelperService?.getClientSideRowModel()?.forEachLeafNode(callback);
}

export function forEachNodeAfterFilter<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void
): void {
    beans.rowModelHelperService?.getClientSideRowModel()?.forEachNodeAfterFilter(callback);
}

export function forEachNodeAfterFilterAndSort<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void
): void {
    beans.rowModelHelperService?.getClientSideRowModel()?.forEachNodeAfterFilterAndSort(callback);
}

export function resetRowHeights(beans: BeanCollection): void {
    if (beans.columnModel.isAutoRowHeightActive()) {
        _warnOnce('calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
        return;
    }
    beans.rowModelHelperService?.getClientSideRowModel()?.resetRowHeights();
}

export function applyTransaction<TData = any>(
    beans: BeanCollection,
    rowDataTransaction: RowDataTransaction<TData>
): RowNodeTransaction<TData> | null | undefined {
    return beans.frameworkOverrides.wrapIncoming(() =>
        beans.rowModelHelperService?.getClientSideRowModel()?.updateRowData(rowDataTransaction)
    );
}

export function applyTransactionAsync<TData = any>(
    beans: BeanCollection,
    rowDataTransaction: RowDataTransaction<TData>,
    callback?: (res: RowNodeTransaction<TData>) => void
): void {
    beans.frameworkOverrides.wrapIncoming(() =>
        beans.rowModelHelperService?.getClientSideRowModel()?.batchUpdateRowData(rowDataTransaction, callback)
    );
}

export function flushAsyncTransactions(beans: BeanCollection): void {
    beans.frameworkOverrides.wrapIncoming(() =>
        beans.rowModelHelperService?.getClientSideRowModel()?.flushAsyncTransactions()
    );
}

export function getBestCostNodeSelection<TData = any>(beans: BeanCollection): IRowNode<TData>[] | undefined {
    return beans.selectionService.getBestCostNodeSelection();
}
