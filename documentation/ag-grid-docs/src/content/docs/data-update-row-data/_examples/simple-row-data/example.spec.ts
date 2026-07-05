import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Toggling row data swaps the displayed rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Data A: 3 rows (no getRowId, so data rows use sequential ids)
        await expect(agIdFor.cell('0', 'make')).toContainText('Toyota');
        await expect(agIdFor.cell('2', 'make')).toContainText('Aston Martin');
        await expect(agIdFor.cell('2', 'price')).toContainText('190000');

        // Switch to Data B: 5 rows including Ford and BMW
        await page.getByRole('button', { name: 'Row Data B', exact: true }).click();
        await expect(agIdFor.cell('1', 'make')).toContainText('Ford');
        await expect(agIdFor.cell('3', 'make')).toContainText('BMW');
        await expect(agIdFor.cell('4', 'make')).toContainText('Aston Martin');

        // Clear removes all rows
        await page.getByRole('button', { name: 'Clear Row Data', exact: true }).click();
        await expect(page.locator('.ag-grid-scrolling-container .ag-row[row-id]')).toHaveCount(0);
    });

    test.eachFramework('Selection is lost across row data changes without row ids', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Select the first row by clicking it
        await agIdFor.cell('0', 'make').click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        // Switching data sets loses the selection (no getRowId provided)
        await page.getByRole('button', { name: 'Row Data B', exact: true }).click();
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });
});
