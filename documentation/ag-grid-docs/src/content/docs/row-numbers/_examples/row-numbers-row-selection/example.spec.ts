import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Clicking a row number selects the row, not its cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.rowNode('1')).not.toHaveClass(/ag-row-selected/);

        await agIdFor.rowNumber('1').click();

        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);
        // The negative half is what distinguishes the suppressed behaviour from the default.
        await expect(agIdFor.cell('1', 'athlete')).not.toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('1', 'bronze')).not.toHaveClass(/ag-cell-range-selected/);

        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });
});
