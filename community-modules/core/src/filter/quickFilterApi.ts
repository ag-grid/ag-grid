import type { BeanCollection } from '../context/context';

export function isQuickFilterPresent(beans: BeanCollection): boolean {
    return !!beans.filterManager?.isQuickFilterPresent();
}

export function getQuickFilter(beans: BeanCollection): string | undefined {
    return beans.gos.get('quickFilterText');
}

export function resetQuickFilter(beans: BeanCollection): void {
    beans.filterManager?.resetQuickFilterCache();
}
