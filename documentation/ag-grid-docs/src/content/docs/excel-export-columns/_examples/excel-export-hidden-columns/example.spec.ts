import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Hidden medal columns are not rendered in the grid', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Visible columns show the first filtered row (rows with a country).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');

        // gold, silver, bronze and total are hidden (hide: true) so are absent from the grid.
        await expect(page.locator('.ag-header-cell[col-id="gold"]')).toHaveCount(0);
        await expect(page.locator('.ag-header-cell[col-id="silver"]')).toHaveCount(0);
        await expect(page.locator('.ag-header-cell[col-id="bronze"]')).toHaveCount(0);
        await expect(page.locator('.ag-header-cell[col-id="total"]')).toHaveCount(0);
    });

    test.eachFramework('Sorting by athlete reorders the visible rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Natalie Coughlin starts at the top but is not first alphabetically (Alicia Coutts is).
        const firstDataRow = agIdFor.rowNode('0');
        await expect(firstDataRow).toHaveAttribute('row-index', '0');

        // Alicia Coutts (data row '1') is alphabetically first and floats to the top on ascending sort.
        await agIdFor.headerCell('athlete').click();
        await expect(firstDataRow).not.toHaveAttribute('row-index', '0');
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Alicia Coutts');
        await expect(agIdFor.rowNode('1')).toHaveAttribute('row-index', '0');
    });
});
