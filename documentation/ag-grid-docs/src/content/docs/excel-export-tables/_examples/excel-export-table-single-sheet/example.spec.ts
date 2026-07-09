import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grouped columns and data render', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of small-olympic-winners.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('0', 'silver')).toContainText('2');
        await expect(agIdFor.cell('0', 'bronze')).toContainText('3');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');

        // The example uses grouped columns (only leaf columns end up in the Excel table).
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Athlete' })).toHaveCount(1);
        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Medals' })).toHaveCount(1);
    });

    test.eachFramework('Sorting by age reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Dara Torres holds the unique maximum age (33) at data index 7.
        const daraRow = agIdFor.rowNode('7').first();
        await expect(daraRow).not.toHaveAttribute('row-index', '0');

        // Ascending sort by age.
        await agIdFor.headerCell('age').click();
        await waitForRowAnimations(page);
        await expect(daraRow).not.toHaveAttribute('row-index', '0');

        // Descending sort brings the oldest athlete to the top.
        await agIdFor.headerCell('age').click();
        await waitForRowAnimations(page);
        await expect(daraRow).toHaveAttribute('row-index', '0');
    });
});
