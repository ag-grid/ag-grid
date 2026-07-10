import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Columns render from simple field definitions', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Columns are athlete, sport, age. First data row is Michael Phelps.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
    });

    test.eachFramework('Sorting by athlete reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const firstRow = agIdFor.rowNode('0'); // Michael Phelps, initially at the top
        await expect(firstRow).toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('athlete').click(); // ascending
        await expect(firstRow).not.toHaveAttribute('row-index', '0');
    });
});
