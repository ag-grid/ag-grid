import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('defaultColDef applies bold cell style to all columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First data row is Michael Phelps and the defaultColDef bolds every cell.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'athlete')).toHaveCSS('font-weight', '700');
        await expect(agIdFor.cell('0', 'age')).toHaveCSS('font-weight', '700');
    });

    test.eachFramework('Sorting by age reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const firstRow = agIdFor.rowNode('0'); // Michael Phelps (age 23), initially at the top
        await expect(firstRow).toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('age').click(); // ascending
        await expect(firstRow).not.toHaveAttribute('row-index', '0');
    });
});
