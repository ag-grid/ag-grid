import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The data is mutated outside the grid ("scramble"), so the grid is unaware until a refresh
// is requested. Each button scrambles then refreshes a different way (all at once, column by
// column, row by row), and change detection updates the cells whose values changed. The grid
// also has two pinned rows top and bottom to show refreshing works for pinned rows.
test.agExample(import.meta, () => {
    const centreText = (page: any) => page.locator('.ag-center-cols-container').first().innerText();
    // Joined text of one column across every centre-viewport row, used to assert a specific
    // column has been refreshed (rather than "some cell somewhere changed").
    const columnText = async (page: any, colId: string) =>
        (await page.locator(`.ag-center-cols-container [col-id="${colId}"]`).allInnerTexts()).join('|');
    // Joined text of the pinned-bottom rows — the very last thing the top-to-bottom sequence refreshes.
    const bottomPinnedText = (page: any) => page.locator('.ag-floating-bottom').first().innerText();

    test.eachFramework('Renders two pinned rows at the top and bottom', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-floating-top .ag-row')).toHaveCount(2);
        await expect(page.locator('.ag-floating-bottom .ag-row')).toHaveCount(2);
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
