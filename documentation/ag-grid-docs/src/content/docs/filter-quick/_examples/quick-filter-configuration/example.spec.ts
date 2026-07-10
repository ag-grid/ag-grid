import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Quick Filter matches value-getter and embedded-field columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const rows = page.locator('.ag-row[row-id]');
        expect(await rows.count()).toBeGreaterThan(1);

        // Singapore is the country of exactly one row; Country uses a value getter.
        await page.locator('#filter-text-box').fill('Singapore');
        await waitForGridContent(page);

        await expect(rows).toHaveCount(1);
        await expect(page.locator('.ag-row[row-id]').first()).toContainText('Singapore');
    });

    test.eachFramework('quickFilterMatcher supports regular expressions', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Regex alternation matches Zimbabwe (2 rows) or Kenya (1 row) => 3 rows.
        await page.locator('#filter-text-box').fill('Zimbabwe|Kenya');
        await waitForGridContent(page);

        await expect(page.locator('.ag-row[row-id]')).toHaveCount(3);
    });

    test.eachFramework('Include Hidden Columns brings the hidden column into the Quick Filter', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const rows = page.locator('.ag-row[row-id]');

        // The hidden column value 'hidden' is excluded by default => no matches.
        await page.locator('#filter-text-box').fill('hidden');
        await waitForGridContent(page);
        await expect(rows).toHaveCount(0);

        // Toggling the option includes the hidden column, so every row now matches.
        await page.locator('#includeHiddenColumns').click();
        await waitForGridContent(page);
        expect(await rows.count()).toBeGreaterThan(0);
    });
});
