import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Cells render the styled Olympic data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First data row: Michael Phelps, age 23, United States.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
    });

    test.eachFramework('Sorting reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row node '0' (age 23) starts at the top.
        const firstRow = agIdFor.rowNode('0');
        await expect(firstRow).toHaveAttribute('row-index', '0');

        // Sorting age ascending pushes younger athletes above it.
        await agIdFor.headerCell('age').click();
        await expect(firstRow).not.toHaveAttribute('row-index', '0');
    });
});
