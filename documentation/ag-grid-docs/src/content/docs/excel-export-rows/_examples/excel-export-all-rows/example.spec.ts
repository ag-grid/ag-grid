import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grid renders the first filtered data rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Data is filtered to rows with a country; the first is Natalie Coughlin (United States).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
    });

    test.eachFramework('Sorting the Athlete column reorders the visible rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Natalie Coughlin (row '0') starts at the top; Alicia Coutts (row '1') is alphabetically first.
        await expect(agIdFor.rowNode('0')).toHaveAttribute('row-index', '0');

        await agIdFor.headerCell('athlete').click();
        await expect(agIdFor.rowNode('0')).not.toHaveAttribute('row-index', '0');
        await expect(agIdFor.rowNode('1')).toHaveAttribute('row-index', '0');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Alicia Coutts');
    });
});
