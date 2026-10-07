import type { BeanCollection } from 'ag-grid-community';

import type { SsrmVisibleRowsService } from './ssrmVisibleRowsService';

/** Rows destroyed by `destroy` are reported to visible row subscribers as reset rather than removed. */
export function _destroyAsVisibleRowsReset(beans: BeanCollection, destroy: () => void): void {
    const visibleRowsSvc = beans.ssrmVisibleRowsSvc as SsrmVisibleRowsService | undefined;
    if (visibleRowsSvc) {
        visibleRowsSvc.runAsReset(destroy);
    } else {
        destroy();
    }
}
