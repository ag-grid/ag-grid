import type { BeanCollection } from '../context/context';

export function expandAll(beans: BeanCollection) {
    beans.expansionSvc?.expandAll(true);
}

export function collapseAll(beans: BeanCollection) {
    beans.expansionSvc?.expandAll(false);
}

export function onRowHeightChanged(beans: BeanCollection) {
    beans.rowModel?.onRowHeightChanged();
}

export function resetRowHeights(beans: BeanCollection) {
    beans.rowModel?.resetRowHeights();
}
