import type { BeanCollection } from 'ag-grid-community';

import type { SsrmVisibleRowsService, VisibleRowsDestroyReason } from './ssrmVisibleRowsService';

/** Rows destroyed by `destroy` are reported to visible row subscribers with `reason` rather than as removed. */
export function _destroyForVisibleRows(
    beans: BeanCollection,
    reason: VisibleRowsDestroyReason,
    destroy: () => void
): void {
    const visibleRowsSvc = beans.ssrmVisibleRowsSvc as SsrmVisibleRowsService | undefined;
    if (visibleRowsSvc) {
        visibleRowsSvc.runDestroying(reason, destroy);
    } else {
        destroy();
    }
}
