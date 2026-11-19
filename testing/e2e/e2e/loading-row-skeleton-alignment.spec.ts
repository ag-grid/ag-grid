import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import type { MountGridParams } from '../src/mountGrid';
import { mountGrid } from '../src/mountGrid';

/** Mounts a grid showing loading rows and returns the gaps above and below the first cell's skeleton bar. */
async function skeletonGaps(page: Page, options: MountGridParams['options']) {
    const { cell } = await mountGrid(page, { options });
    const athleteCell = cell(0, 'athlete');
    const bar = athleteCell.locator('.ag-skeleton-effect');
    await bar.waitFor();

    const cellBox = (await athleteCell.boundingBox())!;
    const barBox = (await bar.boundingBox())!;
    return {
        above: barBox.y - cellBox.y,
        below: cellBox.y + cellBox.height - (barBox.y + barBox.height),
    };
}

test.describe('loading row skeletons', () => {
    test('are vertically centred in the cell with enableCellTextSelection', async ({ page }) => {
        const gaps = await skeletonGaps(page, () => ({
            columnDefs: [{ field: 'athlete' }, { field: 'country' }],
            loading: true,
            loadingRows: { rowCount: 3 },
            enableCellTextSelection: true,
        }));

        expect(Math.abs(gaps.above - gaps.below)).toBeLessThanOrEqual(2);
    });

    test('are vertically centred in the cell with autoHeight', async ({ page }) => {
        const gaps = await skeletonGaps(page, () => ({
            columnDefs: [{ field: 'athlete' }, { field: 'country' }],
            defaultColDef: { autoHeight: true },
            loading: true,
            loadingRows: { rowCount: 3 },
        }));

        expect(Math.abs(gaps.above - gaps.below)).toBeLessThanOrEqual(2);
    });
});
