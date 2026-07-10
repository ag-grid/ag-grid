import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the first row from the source data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First record in olympic-winners.json is Michael Phelps (United States, 2008, 8 gold).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Save Sort and Restore Sort round-trip only the sort state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Sort athlete ascending, then save just the sort state.
        await agIdFor.headerCell('athlete').click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        await page.getByRole('button', { name: 'Save Sort' }).click();

        // Change the sort to gold - athlete sort clears.
        await agIdFor.headerCell('gold').click();
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'ascending');
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');

        // Restore Sort re-applies the saved athlete-ascending sort and clears gold.
        await page.getByRole('button', { name: 'Restore Sort' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'none');
    });
});
