import type { BeanCollection } from '../context/context';
import type { FilterChangedEventSourceType } from '../events';

export function isAnyFilterPresent(beans: BeanCollection): boolean {
    return !!beans.filterManager?.isAnyFilterPresent();
}

export function onFilterChanged(beans: BeanCollection, source: FilterChangedEventSourceType = 'api') {
    beans.filterManager?.onFilterChanged({ source });
}
