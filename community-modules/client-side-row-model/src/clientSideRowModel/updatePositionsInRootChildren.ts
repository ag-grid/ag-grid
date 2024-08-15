import type { RowNode } from '@ag-grid-community/core';

/**
 * Updates the `positionInRootChildren` for each row based on the current order in the array.
 * @param rows The rows to update
 */
export function updatePositionsInRootChildren(rows: RowNode[] | null | undefined): void {
    if (rows) {
        const length = rows.length;
        for (let index = 0; index < length; ++index) {
            const row = rows[index];
            if (row.positionInRootChildren !== index) {
                row.positionInRootChildren = index;
            }
        }
    }
}
