import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders no selection checkboxes', async ({ page }) => {
        await ensureGridReady(page);

        // checkboxes: false removes the checkbox column entirely.
        await expect(page.locator('.ag-grid-scrolling-container .ag-selection-checkbox')).toHaveCount(0);
    });

    test.eachFramework('restores the initial selection from grid state', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // initialState.rowSelection is ['2'].
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('click selection selects a single row at a time', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // enableClickSelection: true — clicking a row cell selects the row.
        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        // singleRow mode — the previously selected row 2 is deselected.
        await expect(agIdFor.rowNode('2')).not.toHaveClass(/ag-row-selected/);
    });
});
