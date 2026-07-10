import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the first row from the source data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First record in olympic-winners.json is Michael Phelps (United States, 2008, 8 gold).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Sorting updates the aria-sort attribute on the header', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const goldHeader = agIdFor.headerCell('gold');
        await goldHeader.click(); // ascending
        await expect(goldHeader).toHaveAttribute('aria-sort', 'ascending');
        await page.waitForTimeout(300); // avoid the second click registering as a double-click
        await goldHeader.click(); // descending
        await expect(goldHeader).toHaveAttribute('aria-sort', 'descending');
    });

    test.eachFramework('Exposes grid ARIA roles for screen readers', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Flat data (no grouping / tree data) => role="grid" with a column count matching the 9 columnDefs.
        const grid = page.locator('[role="grid"]');
        await expect(grid.first()).toHaveAttribute('aria-colcount', '9');
        await expect(page.locator('[role="columnheader"]').first()).toBeVisible();
    });
});
