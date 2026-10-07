import type { BeanCollection } from '../context/context';
import type { VisibleRowsDestroyReason } from './visibleRowsService';

/**
 * Rows destroyed by `destroy` are reported to visible row subscribers with `reason` rather than as removed.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _destroyForVisibleRows(
    beans: BeanCollection,
    reason: VisibleRowsDestroyReason,
    destroy: () => void
): void {
    const visibleRowsSvc = beans.visibleRowsSvc;
    if (visibleRowsSvc) {
        visibleRowsSvc.runDestroying(reason, destroy);
    } else {
        destroy();
    }
}
