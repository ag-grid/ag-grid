import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the first row from the source data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First record in olympic-winners.json is Michael Phelps (United States, 2008, 8 gold).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });

    test.eachFramework('Save, restore and reset column state round-trips the sort', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Sort athlete ascending, then save that state.
        await agIdFor.headerCell('athlete').click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        await page.getByRole('button', { name: 'Save State' }).click();

        // Change the sort to a different column - the saved state is now stale.
        await agIdFor.headerCell('gold').click();
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'ascending');
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');

        // Restore returns the sort to the saved athlete-ascending state.
        await page.getByRole('button', { name: 'Restore State' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'ascending');
        await expect(agIdFor.headerCell('gold')).toHaveAttribute('aria-sort', 'none');

        // Reset returns to the column definitions, which carry no sort.
        await page.getByRole('button', { name: 'Reset State' }).click();
        await expect(agIdFor.headerCell('athlete')).toHaveAttribute('aria-sort', 'none');
    });
});
