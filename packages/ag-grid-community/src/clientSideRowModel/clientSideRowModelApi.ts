import type { BeanCollection } from '../context/context';
import type { ClientSideRowModelStep } from '../interfaces/iClientSideRowModel';
import type { IRowNode } from '../interfaces/iRowNode';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import type { RowNodeTransaction } from '../interfaces/rowNodeTransaction';
import { _logWarn } from '../validation/logging';

export function onGroupExpandedOrCollapsed(beans: BeanCollection): void {
    beans.expansionService?.onGroupExpandedOrCollapsed();
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

export function getLeafNodesIterator<TData = any>(beans: BeanCollection): Generator<IRowNode<TData>> {
    return beans.rowModelHelperService?.getClientSideRowModel()?.getLeafNodesIterator() ?? getEmptyGenerator();
}

export function forEachNodeAfterFilter<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void
): void {
    beans.rowModelHelperService?.getClientSideRowModel()?.forEachNodeAfterFilter(callback);
}

export function getNodesAfterFilterIterator<TData = any>(beans: BeanCollection): Generator<IRowNode<TData>> {
    return beans.rowModelHelperService?.getClientSideRowModel()?.getNodesAfterFilterIterator() ?? getEmptyGenerator();
}

export function forEachNodeAfterFilterAndSort<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void
): void {
    beans.rowModelHelperService?.getClientSideRowModel()?.forEachNodeAfterFilterAndSort(callback);
}

export function getNodesAfterFilterAndSortIterator<TData = any>(beans: BeanCollection): Generator<IRowNode<TData>> {
    return (
        beans.rowModelHelperService?.getClientSideRowModel()?.getNodesAfterFilterAndSortIterator() ??
        getEmptyGenerator()
    );
}

export function resetRowHeights(beans: BeanCollection): void {
    if (beans.columnModel.isAutoRowHeightActive()) {
        _logWarn(3, {});
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
    return beans.selectionService?.getBestCostNodeSelection();
}

function* getEmptyGenerator() {}
