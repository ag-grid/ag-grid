import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('restores the initial selection from grid state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // initialState.rowSelection is ['2'], so row 2 is selected on load.
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('selecting a new row replaces the previous selection', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Selecting row 0 deselects the initially-selected row 2 (singleRow mode).
        await agIdFor.selectionColumnCheckbox('0').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('2')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('clicking a selected checkbox deselects the row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Row 2 starts selected; clicking its checkbox deselects it.
        await agIdFor.selectionColumnCheckbox('2').first().click();
        await expect(agIdFor.rowNode('2')).not.toHaveClass(/ag-row-selected/);
    });
});
