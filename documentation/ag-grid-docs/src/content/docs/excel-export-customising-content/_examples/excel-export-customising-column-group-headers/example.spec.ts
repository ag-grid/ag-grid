import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grouped columns render athlete data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Column group headers over the underlying columns.
        await expect(page.locator('.ag-header-group-cell-label', { hasText: 'Athlete details' })).toBeVisible();
        await expect(page.locator('.ag-header-group-cell-label', { hasText: 'Medal results' })).toBeVisible();

        // First data row from small-olympic-winners.json.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
    });

    test.eachFramework('Sorting reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const firstRow = agIdFor.rowNode('0');
        await expect(firstRow).toHaveAttribute('row-index', '0');

        // Sort ascending by gold, then descending; the first data row (gold 1)
        // should no longer be at the top of the descending order.
        await agIdFor.headerCell('gold').click();
        await waitForRowAnimations(page);
        await expect(firstRow).toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('gold').click();
        await waitForRowAnimations(page);
        await expect(firstRow).not.toHaveAttribute('row-index', '0');
    });
});
