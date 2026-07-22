import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('isRowMaster only makes rows with call records expandable', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row '0' (Nora Thomas) has no call records, so isRowMaster returns false: the cell is not
        // expandable and neither expand control is shown.
        await expect(agIdFor.cell('0', 'name')).toContainText('Nora Thomas');
        await expect(agIdFor.cell('0', 'name').locator('.ag-cell-expandable')).toHaveCount(0);
        await expect(agIdFor.groupContracted('0', 'name')).not.toBeVisible();
        await expect(agIdFor.groupExpanded('0', 'name')).not.toBeVisible();

        // Row '1' has call records, so it is a master row: the cell is expandable.
        // onFirstDataRendered expands the row at index 1, so its expanded control is shown.
        await expect(agIdFor.cell('1', 'name').locator('.ag-cell-expandable')).toBeVisible();
        await expect(agIdFor.groupExpanded('1', 'name')).toBeVisible();

        // Row '2' is also a master row but collapsed, so its contracted control is shown.
        await expect(agIdFor.cell('2', 'name').locator('.ag-cell-expandable')).toBeVisible();
        await expect(agIdFor.groupContracted('2', 'name')).toBeVisible();
    });

    test.eachFramework('Auto-expanded master row renders its detail grid with call columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Exactly one detail grid on load (the auto-expanded master row).
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);
        await expect(detailRows.first()).toBeVisible();

        // Detail grid exposes the call-record columns from detailGridOptions.
        const detailHeader = detailRows.first().locator('.ag-header-cell-text');
        await expect(detailHeader).toContainText(['Call Id', 'Direction', 'Number', 'Duration', 'Switch Code']);
    });
});
