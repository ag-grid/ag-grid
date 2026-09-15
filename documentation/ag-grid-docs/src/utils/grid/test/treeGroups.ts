import type { Locator } from '@playwright/test';
import { expect } from 'playwright/test';

import type { wrapAgTestIdFor } from 'ag-grid-community';

type AgIdFor = ReturnType<typeof wrapAgTestIdFor<Locator>>;

/**
 * The row id the grid generates for a tree-data group with no row of its own - a filler node.
 *
 * Segments are the `getDataPath` keys from the root down, so `['Documents', 'Work']` gives
 * `row-group-0-Documents-1-Work`. Only valid while every group on the path is a filler: a group that
 * does have a row of its own is keyed by that row's id - `getRowId`, or its `rowData` index by default.
 */
export const treeFillerId = (path: string[]) => `row-group-${path.map((key, level) => `${level}-${key}`).join('-')}`;

/** Expands each of the given group rows that is still collapsed, leaving already-open ones alone. */
export async function expandGroupRows(agIdFor: AgIdFor, rowIds: string[]) {
    for (const rowId of rowIds) {
        const contracted = agIdFor.autoGroupContracted(rowId);
        // Either icon proves the row is rendered, so an already-open group is a no-op rather than a
        // failure - but a row that never arrives still fails here rather than on a silent no-click.
        await expect(contracted.or(agIdFor.autoGroupExpanded(rowId))).toBeVisible();
        if (await contracted.isVisible()) {
            await contracted.click();
        }
    }
}
