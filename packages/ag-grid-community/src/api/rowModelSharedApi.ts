import type { BeanCollection } from '../context/context';
import { _warn } from '../validation/logging';

export function expandAll(beans: BeanCollection) {
    beans.expansionSvc?.expandAll(true);
}

export function collapseAll(beans: BeanCollection) {
    beans.expansionSvc?.expandAll(false);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function onRowHeightChanged(beans: BeanCollection) {
    beans.rowModel?.onRowHeightChanged();
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function resetRowHeights(beans: BeanCollection) {
    if (beans.rowAutoHeight?.active) {
        _warn(3);
        return;
    }
    beans.rowModel?.resetRowHeights();
}
