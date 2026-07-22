import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const SELECTION_COL = 'ag-Grid-SelectionColumn';

test.agExample(import.meta, () => {
    test.eachFramework('the customised checkbox column still selects rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await agIdFor.selectionColumnCheckbox('0').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('the selection column is sortable via its header', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // selectionColumnDef.sortable: true — clicking the header applies a sort.
        await agIdFor.headerCell(SELECTION_COL).first().click();
        await expect(agIdFor.headerCell(SELECTION_COL).first()).toHaveClass(/ag-header-cell-sorted-asc/);
    });
});
