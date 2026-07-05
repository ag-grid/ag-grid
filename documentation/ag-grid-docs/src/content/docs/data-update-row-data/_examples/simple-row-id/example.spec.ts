import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Row ids map data to stable row nodes across updates', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Data A: ids 1, 4, 5 (getRowId returns data.id)
        await expect(agIdFor.cell('1', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('4', 'make')).toContainText('BMW');
        await expect(agIdFor.cell('5', 'make')).toContainText('Aston Martin');

        // Switch to Data B: ids 2 and 3 (Ford, Porsche) are added
        await page.getByRole('button', { name: 'Row Data B', exact: true }).click();
        await expect(agIdFor.cell('2', 'make')).toContainText('Ford');
        await expect(agIdFor.cell('3', 'make')).toContainText('Porsche');
        await expect(agIdFor.cell('1', 'make')).toContainText('Toyota');
    });

    test.eachFramework('Selection is maintained across row data changes with row ids', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Select the Toyota row (id 1)
        await agIdFor.cell('1', 'make').click();
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);

        // Switching data sets keeps the selection because the row exists in both
        await page.getByRole('button', { name: 'Row Data B', exact: true }).click();
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);
    });
});
