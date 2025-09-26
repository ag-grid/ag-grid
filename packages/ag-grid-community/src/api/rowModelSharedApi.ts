import type { BeanCollection } from '../context/context';
import { _warn } from '../validation/logging';

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
    if (beans.rowAutoHeight?.active) {
        _warn(3);
        return;
    }
    beans.rowModel?.resetRowHeights();
}
