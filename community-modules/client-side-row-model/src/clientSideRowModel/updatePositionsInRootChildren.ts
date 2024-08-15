import type { RowNode } from '@ag-grid-community/core';

/**
 * Updates the `positionInRootChildren` for each row based on the current order in the array.
 * @param rows The rows to update
 * @returns `true` if the order was changed, `false` otherwise
 */
export function updatePositionsInRootChildren(rows: RowNode[] | null | undefined): boolean {
    const length = rows?.length;
    if (!length) {
        return false; // no rows to update
    }

    let orderChanged = false;

    let prevPosition = -1;
    for (let index = 0; index < length; ++index) {
        const row = rows[index];
        const positionInRootChildren = row.positionInRootChildren;
        if (positionInRootChildren <= prevPosition) {
            row.positionInRootChildren = ++prevPosition;
            orderChanged = true;
        } else {
            prevPosition = positionInRootChildren;
        }
    }

    return orderChanged;
}
