import type { BeanCollection } from '../main';

export function refreshInfiniteCache(beans: BeanCollection): void {
    beans.rowModelHelperService?.getInfiniteRowModel()?.refreshCache();
}

export function purgeInfiniteCache(beans: BeanCollection): void {
    beans.rowModelHelperService?.getInfiniteRowModel()?.purgeCache();
}

export function getInfiniteRowCount(beans: BeanCollection): number | undefined {
    return beans.rowModelHelperService?.getInfiniteRowModel()?.getRowCount();
}
