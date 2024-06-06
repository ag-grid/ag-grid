import type { BeanCollection } from '@ag-grid-community/core';
import { _logMissingRowModel } from '@ag-grid-community/core';

export function refreshInfiniteCache(beans: BeanCollection): void {
    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        infiniteRowModel.refreshCache();
    } else {
        _logMissingRowModel('refreshInfiniteCache', 'infinite');
    }
}

export function purgeInfiniteCache(beans: BeanCollection): void {
    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        infiniteRowModel.purgeCache();
    } else {
        _logMissingRowModel('purgeInfiniteCache', 'infinite');
    }
}

export function getInfiniteRowCount(beans: BeanCollection): number | undefined {
    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        return infiniteRowModel.getRowCount();
    } else {
        _logMissingRowModel('getInfiniteRowCount', 'infinite');
    }
}

export function isLastRowIndexKnown(beans: BeanCollection): boolean | undefined {
    const infiniteRowModel = beans.rowModelHelperService?.getInfiniteRowModel();
    if (infiniteRowModel) {
        return infiniteRowModel.isLastRowIndexKnown();
    } else {
        _logMissingRowModel('isLastRowIndexKnown', 'infinite');
    }
}
