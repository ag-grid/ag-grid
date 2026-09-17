import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Clicking a row number selects the row, not its cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The row number column is pinned, so each row renders once per container.
        const row1 = agIdFor.rowNode('1').first();
        await expect(row1).not.toHaveClass(/ag-row-selected/);

        await agIdFor.rowNumber('1').click();

        await expect(row1).toHaveClass(/ag-row-selected/);
        // The negative half is what distinguishes the suppressed behaviour from the default.
        await expect(agIdFor.cell('1', 'athlete')).not.toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('1', 'bronze')).not.toHaveClass(/ag-cell-range-selected/);

        await expect(agIdFor.rowNode('0').first()).not.toHaveClass(/ag-row-selected/);
    });
});
