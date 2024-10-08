import { _getInfiniteRowModel } from '../api/rowModelApiUtils';
import type { BeanCollection } from '../context/context';

export function refreshInfiniteCache(beans: BeanCollection): void {
    _getInfiniteRowModel(beans)?.refreshCache();
}

export function purgeInfiniteCache(beans: BeanCollection): void {
    _getInfiniteRowModel(beans)?.purgeCache();
}

export function getInfiniteRowCount(beans: BeanCollection): number | undefined {
    return _getInfiniteRowModel(beans)?.getRowCount();
}
