import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders sequential row numbers', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.rowNumber('0')).toContainText('1');
        await expect(agIdFor.rowNumber('1')).toContainText('2');
        await expect(agIdFor.rowNumber('2')).toContainText('3');
    });

    test.eachFramework('Clicking a row number selects the whole row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Before clicking, the row's cells are not part of any selection range.
        await expect(agIdFor.cell('1', 'athlete')).not.toHaveClass(/ag-cell-range-selected/);

        // Clicking the row number selects every visible cell in that row.
        await agIdFor.rowNumber('1').click();
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('1', 'country')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('1', 'bronze')).toHaveClass(/ag-cell-range-selected/);

        // A different row remains unselected.
        await expect(agIdFor.cell('0', 'athlete')).not.toHaveClass(/ag-cell-range-selected/);
    });
});
