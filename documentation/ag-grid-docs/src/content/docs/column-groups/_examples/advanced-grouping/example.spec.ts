import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Data renders under the deeply nested column groups', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The 'Athlete 1' column (field athlete) is always visible.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // The multi-level group headers are present.
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Group A' })).toHaveCount(1);
    });

    test.eachFramework('Expand All / Contract All open and close every group via the API', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Contract All' }).click();
        const collapsedCount = await page.locator('.ag-header-cell').count();

        await page.getByRole('button', { name: 'Expand All' }).click();
        // Opening every group reveals additional 'open'-only columns.
        const expandedCount = await page.locator('.ag-header-cell').count();
        expect(expandedCount).toBeGreaterThan(collapsedCount);

        // A column that only appears when fully expanded is now visible.
        await expect(page.locator('.ag-header-cell').filter({ hasText: 'Total 2' }).first()).toBeVisible();
    });
});
