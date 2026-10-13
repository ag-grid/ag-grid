import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';

/** Opens (`true`) or closes (`false`) a window in which column width changes animate when `animateColumnResizing` is set. */
export function _setColumnWidthAnimation({ ctrlsSvc }: BeanCollection, enable: boolean): void {
    const gridBodyCtrl = ctrlsSvc.isAlive() ? ctrlsSvc.get('gridBodyCtrl') : undefined;
    if (enable) {
        gridBodyCtrl?.startColumnWidthAnimation();
    } else {
        gridBodyCtrl?.finishColumnWidthAnimation();
    }
}

/**
 * Opens a width animation window for an operation that may also reorder columns, returning the function that closes it.
 * The transition slides cells too, so a reorder drops the window when `suppressColumnMoveAnimation` is set.
 */
export function _startReorderingColumnWidthAnimation(beans: BeanCollection): () => void {
    const { gos, visibleCols, ctrlsSvc } = beans;
    const orderBefore =
        gos.get('animateColumnResizing') && gos.get('suppressColumnMoveAnimation') ? visibleCols.allCols : null;
    _setColumnWidthAnimation(beans, true);
    return () => {
        const gridBodyCtrl = ctrlsSvc.isAlive() ? ctrlsSvc.get('gridBodyCtrl') : undefined;
        gridBodyCtrl?.finishColumnWidthAnimation(orderBefore != null && hasReordered(orderBefore, visibleCols.allCols));
    };
}

/** Drops any lingering animation window so the next width changes apply immediately, e.g. during a header drag. */
export function _cancelColumnWidthAnimation({ ctrlsSvc }: BeanCollection): void {
    const gridBodyCtrl = ctrlsSvc.isAlive() ? ctrlsSvc.get('gridBodyCtrl') : undefined;
    gridBodyCtrl?.cancelColumnWidthAnimation();
}

/** Whether the columns displayed both before and after changed their relative order. */
function hasReordered(before: AgColumn[], after: AgColumn[]): boolean {
    const beforeSet = new Set(before);
    const afterSet = new Set(after);
    const beforeLen = before.length;
    const afterLen = after.length;
    let i = 0;
    let j = 0;
    for (;;) {
        while (i < beforeLen && !afterSet.has(before[i])) {
            ++i;
        }
        while (j < afterLen && !beforeSet.has(after[j])) {
            ++j;
        }
        if (i >= beforeLen || j >= afterLen) {
            return false;
        }
        if (before[i] !== after[j]) {
            return true;
        }
        ++i;
        ++j;
    }
}
