import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Quick Filter narrows rows to those matching every word', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const rows = page.locator('.ag-row[row-id]');
        expect(await rows.count()).toBeGreaterThan(3);

        // Michael Phelps appears in exactly 3 rows of olympic-winners.json.
        await page.locator('#filter-text-box').fill('Michael Phelps');
        await waitForGridContent(page);

        await expect(rows).toHaveCount(3);
        const athleteCells = page.locator('.ag-row[row-id] [col-id="athlete"]');
        const count = await athleteCells.count();
        for (let i = 0; i < count; i++) {
            await expect(athleteCells.nth(i)).toContainText('Michael Phelps');
        }
    });

    test.eachFramework('Clearing the Quick Filter restores all rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#filter-text-box').fill('Michael Phelps');
        await waitForGridContent(page);
        await expect(page.locator('.ag-row[row-id]')).toHaveCount(3);

        await page.locator('#filter-text-box').fill('');
        await waitForGridContent(page);
        expect(await page.locator('.ag-row[row-id]').count()).toBeGreaterThan(3);
    });
});
