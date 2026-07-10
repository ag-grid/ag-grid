import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('All columns and headers are rendered', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of small-olympic-winners (filtered to rows with a country).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('0', 'silver')).toContainText('2');
        await expect(agIdFor.cell('0', 'bronze')).toContainText('3');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');

        // Grouped header rows are present.
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Top Level Column Group' })).toHaveCount(
            1
        );
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Group A' })).toHaveCount(1);
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Group B' })).toHaveCount(1);
    });

    test.eachFramework('Sorting by total reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Natalie Coughlin holds the unique maximum total (6) and starts at the top.
        const topRow = agIdFor.rowNode('0');
        await expect(topRow).toHaveAttribute('row-index', '0');

        // Ascending sort pushes the maximum to the bottom.
        await agIdFor.headerCell('total').click();
        await waitForRowAnimations(page);
        await expect(topRow).not.toHaveAttribute('row-index', '0');

        await page.waitForTimeout(300); // avoid a double-click
        // Descending sort brings the maximum back to the top.
        await agIdFor.headerCell('total').click();
        await waitForRowAnimations(page);
        await expect(topRow).toHaveAttribute('row-index', '0');
    });
});
