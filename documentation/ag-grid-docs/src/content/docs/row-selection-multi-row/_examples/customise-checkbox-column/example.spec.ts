import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const SELECTION_COL = 'ag-Grid-SelectionColumn';

test.agExample(import.meta, () => {
    test.eachFramework('rows 3-8 are selected on first render', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // onFirstDataRendered selects nodes with rowIndex 3..8 inclusive.
        await expect(agIdFor.rowNode('3')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('2')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('the selection column is pinned to the left', async ({ page }) => {
        await ensureGridReady(page);

        // selectionColumnDef.pinned: 'left' — the select-all header lives in the left pinned container.
        await expect(page.locator('.ag-pinned-left-header .ag-header-select-all').first()).toBeVisible();
    });

    test.eachFramework('the selection column is sortable via its header', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await agIdFor.headerCell(SELECTION_COL).first().click();
        await expect(agIdFor.headerCell(SELECTION_COL).first()).toHaveClass(/ag-header-cell-sorted-asc/);
    });
});
