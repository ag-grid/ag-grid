import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The data is mutated outside the grid ("scramble"), so the grid is unaware until a refresh
// is requested. Each button scrambles then refreshes a different way (all at once, column by
// column, row by row), and change detection updates the cells whose values changed. The grid
// also has two pinned rows top and bottom to show refreshing works for pinned rows.
test.agExample(import.meta, () => {
    const centreText = (page: any) => page.locator('.ag-grid-scrolling-container').first().innerText();
    // Joined text of one column across every centre-viewport row, used to assert a specific
    // column has been refreshed (rather than "some cell somewhere changed").
    const columnText = async (page: any, colId: string) =>
        (await page.locator(`.ag-grid-scrolling-container [col-id="${colId}"]`).allInnerTexts()).join('|');
    // Joined text of the pinned-bottom rows — the very last thing the top-to-bottom sequence refreshes.
    const bottomPinnedText = (page: any) => page.locator('.ag-grid-pinned-bottom-rows-container').first().innerText();

    test.eachFramework('Renders two pinned rows at the top and bottom', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-grid-pinned-top-rows-container .ag-row')).toHaveCount(2);
        await expect(page.locator('.ag-grid-pinned-bottom-rows-container .ag-row')).toHaveCount(2);
    });

    test.eachFramework('Scramble & Refresh All propagates out-of-band data changes to the cells', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const before = await centreText(page);

        await page.getByRole('button', { name: 'Scramble & Refresh All', exact: true }).click();

        // Change detection repaints the scrambled cells, so the displayed values change.
        await expect(async () => {
            expect(await centreText(page)).not.toBe(before);
        }).toPass({ timeout: 15000 });
    });

    test.eachFramework('Column A is excluded from flashing', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Scramble & Refresh All', exact: true }).click();

        // defaultColDef sets enableCellChangeFlash, so changed cells flash — except column
        // 'a', which opts out with enableCellChangeFlash: false.
        const flashed = page.locator('.ag-cell-data-changed, .ag-cell-data-changed-animation');
        await expect(flashed.first()).toBeVisible({ timeout: 15000 });
        await expect(page.locator('[col-id="a"].ag-cell-data-changed')).toHaveCount(0);
    });

    test.eachFramework('Force Refresh flashes unchanged cells too', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByLabel('Force Refresh').check();
        await page.getByRole('button', { name: 'Scramble & Refresh All', exact: true }).click();

        // Without force, scramble only changes ~50% of the cells, so only those flash. With
        // force, change detection is bypassed and every flash-enabled cell is refreshed — so
        // a whole column flashes at once.
        const rowCount = await page.locator('.ag-grid-scrolling-container .ag-row').count();
        expect(rowCount).toBeGreaterThan(0);
        await expect(page.locator('.ag-grid-scrolling-container [col-id="b"].ag-cell-data-changed')).toHaveCount(
            rowCount,
            { timeout: 15000 }
        );
        // 'a' still opts out, even under a forced refresh.
        await expect(page.locator('[col-id="a"].ag-cell-data-changed')).toHaveCount(0);
    });

    test.eachFramework('Suppress Flash updates the cells without flashing them', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Force Refresh as well, so every cell is refreshed and the absence of flashing can
        // only be down to suppressFlash rather than to change detection skipping cells.
        await page.getByLabel('Force Refresh').check();
        await page.getByLabel('Suppress Flash').check();

        const before = await centreText(page);
        await page.getByRole('button', { name: 'Scramble & Refresh All', exact: true }).click();

        await expect(async () => {
            expect(await centreText(page)).not.toBe(before);
        }).toPass({ timeout: 15000 });

        // The values updated, but suppressFlash means no cell was ever marked as changed.
        await expect(page.locator('.ag-cell-data-changed, .ag-cell-data-changed-animation')).toHaveCount(0);
    });

    test.eachFramework('Scramble & Refresh Left to Right updates the displayed cells', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // 'f' is the rightmost column and therefore the last one the sequence refreshes.
        const rightmostBefore = await columnText(page, 'f');

        await page.getByRole('button', { name: 'Scramble & Refresh Left to Right', exact: true }).click();

        // Columns are refreshed one at a time (100ms apart), left to right. Asserting the rightmost
        // column changed proves the whole sequence ran to completion, not just the first column.
        await expect(async () => {
            expect(await columnText(page, 'f')).not.toBe(rightmostBefore);
        }).toPass({ timeout: 15000 });
    });

    test.eachFramework('Scramble & Refresh Top to Bottom updates the displayed cells', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The sequence refreshes pinned-top rows, then the centre rows, and finally the pinned-bottom
        // rows — so the pinned-bottom rows are the last thing refreshed.
        const bottomBefore = await bottomPinnedText(page);

        await page.getByRole('button', { name: 'Scramble & Refresh Top to Bottom', exact: true }).click();

        // Rows are refreshed one at a time (100ms apart), top to bottom. Asserting the pinned-bottom
        // rows changed proves the sequence reached the final rows, not just the first row.
        await expect(async () => {
            expect(await bottomPinnedText(page)).not.toBe(bottomBefore);
        }).toPass({ timeout: 15000 });
    });
});
