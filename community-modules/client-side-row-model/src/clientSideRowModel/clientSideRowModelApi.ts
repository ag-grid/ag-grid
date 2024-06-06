import type {
    BeanCollection,
    ClientSideRowModelStep,
    IRowNode,
    RowDataTransaction,
    RowNodeTransaction,
} from '@ag-grid-community/core';
import { _exists, _logMissingRowModel, _missing } from '@ag-grid-community/core';

export function onGroupExpandedOrCollapsed(beans: BeanCollection) {
    if (_missing(beans.rowModelHelperService?.getClientSideRowModel())) {
        _logMissingRowModel('onGroupExpandedOrCollapsed', 'clientSide');
        return;
    }
    beans.expansionService.onGroupExpandedOrCollapsed();
}

export function refreshClientSideRowModel(beans: BeanCollection, step?: ClientSideRowModelStep): any {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_missing(clientSideRowModel)) {
        _logMissingRowModel('refreshClientSideRowModel', 'clientSide');
        return;
    }

    clientSideRowModel.refreshModel(step);
}

export function forEachLeafNode<TData = any>(beans: BeanCollection, callback: (rowNode: IRowNode<TData>) => void) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_missing(clientSideRowModel)) {
        _logMissingRowModel('forEachLeafNode', 'clientSide');
        return;
    }
    clientSideRowModel.forEachLeafNode(callback);
}

export function forEachNodeAfterFilter<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void
) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_missing(clientSideRowModel)) {
        _logMissingRowModel('forEachNodeAfterFilter', 'clientSide');
        return;
    }
    clientSideRowModel.forEachNodeAfterFilter(callback);
}

export function forEachNodeAfterFilterAndSort<TData = any>(
    beans: BeanCollection,
    callback: (rowNode: IRowNode<TData>, index: number) => void
) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_missing(clientSideRowModel)) {
        _logMissingRowModel('forEachNodeAfterFilterAndSort', 'clientSide');
        return;
    }
    clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
}

export function resetRowHeights(beans: BeanCollection) {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (_exists(clientSideRowModel)) {
        if (beans.columnModel.isAutoRowHeightActive()) {
            console.warn('AG Grid: calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
            return;
        }
        clientSideRowModel.resetRowHeights();
    }
}

export function applyTransaction<TData = any>(
    beans: BeanCollection,
    rowDataTransaction: RowDataTransaction<TData>
): RowNodeTransaction<TData> | null | undefined {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (!clientSideRowModel) {
        _logMissingRowModel('applyTransaction', 'clientSide');
        return;
    }
    return beans.frameworkOverrides.wrapIncoming(() => clientSideRowModel.updateRowData(rowDataTransaction));
}

export function applyTransactionAsync<TData = any>(
    beans: BeanCollection,
    rowDataTransaction: RowDataTransaction<TData>,
    callback?: (res: RowNodeTransaction<TData>) => void
): void {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (!clientSideRowModel) {
        _logMissingRowModel('applyTransactionAsync', 'clientSide');
        return;
    }
    beans.frameworkOverrides.wrapIncoming(() => clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback));
}

export function flushAsyncTransactions(beans: BeanCollection): void {
    const clientSideRowModel = beans.rowModelHelperService?.getClientSideRowModel();
    if (!clientSideRowModel) {
        _logMissingRowModel('flushAsyncTransactions', 'clientSide');
        return;
    }
    beans.frameworkOverrides.wrapIncoming(() => clientSideRowModel.flushAsyncTransactions());
}

export function getBestCostNodeSelection<TData = any>(beans: BeanCollection): IRowNode<TData>[] | undefined {
    if (_missing(beans.rowModelHelperService?.getClientSideRowModel())) {
        _logMissingRowModel('getBestCostNodeSelection', 'clientSide');
        return;
    }
    return beans.selectionService.getBestCostNodeSelection();
}
