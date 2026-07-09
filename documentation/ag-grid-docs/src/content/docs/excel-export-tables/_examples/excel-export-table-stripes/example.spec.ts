import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Flat columns and data render', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First row of small-olympic-winners.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('1');
        await expect(agIdFor.cell('0', 'total')).toContainText('6');
    });

    test.eachFramework('Sorting by age reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Dara Torres holds the unique maximum age (33) at data index 7.
        const daraRow = agIdFor.rowNode('7').first();
        await expect(daraRow).not.toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('age').click();
        await waitForRowAnimations(page);
        await expect(daraRow).not.toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('age').click();
        await waitForRowAnimations(page);
        await expect(daraRow).toHaveAttribute('row-index', '0');
    });
});
