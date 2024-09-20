import type { BeanCollection } from '../context/context';

export function onSortChanged(beans: BeanCollection) {
    beans.sortController.onSortChanged('api');
}
