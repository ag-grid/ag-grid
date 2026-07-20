import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The data is mutated outside the grid ("scramble"), so the grid is unaware until a refresh
// is requested. Each button scrambles then refreshes a different way (all at once, column by
// column, row by row), and change detection updates the cells whose values changed. The grid
// also has two pinned rows top and bottom to show refreshing works for pinned rows.
test.agExample(import.meta, () => {
    const centreText = (page: any) => page.locator('.ag-center-cols-container').first().innerText();

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

        const before = await centreText(page);

        await page.getByRole('button', { name: 'Scramble & Refresh Left to Right', exact: true }).click();

        // Columns are refreshed one at a time (100ms apart); once done the values reflect the scramble.
        await expect(async () => {
            expect(await centreText(page)).not.toBe(before);
        }).toPass({ timeout: 15000 });
    });

    test.eachFramework('Scramble & Refresh Top to Bottom updates the displayed cells', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const before = await centreText(page);

        await page.getByRole('button', { name: 'Scramble & Refresh Top to Bottom', exact: true }).click();

        // Rows are refreshed one at a time (100ms apart); once done the values reflect the scramble.
        await expect(async () => {
            expect(await centreText(page)).not.toBe(before);
        }).toPass({ timeout: 15000 });
    });
});
