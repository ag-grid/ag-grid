import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const item = (page: any, label: string) =>
    page.locator('.ag-set-filter').first().locator('.ag-set-filter-item').filter({ hasText: label }).first();

test.agExample(import.meta, () => {
    test.eachFramework('Async callback populates the filter list after a delay', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Values are supplied via params.success(['value 1', 'value 2']) after a 3s timeout.
        await agIdFor.floatingFilterButton('value').click();
        await expect(item(page, 'value 1')).toBeVisible({ timeout: 8000 });
        await expect(item(page, 'value 2')).toBeVisible();
    });

    test.eachFramework('Selecting a loaded value filters the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await agIdFor.floatingFilterButton('value').click();
        await expect(item(page, 'value 1')).toBeVisible({ timeout: 8000 });

        // Deselect all, then select only 'value 1' (4 of the 9 rows).
        await item(page, '(Select All)').click();
        await item(page, 'value 1').click();
        await page.keyboard.press('Escape');

        await expect(page.locator('.ag-row')).toHaveCount(4);
    });
});
