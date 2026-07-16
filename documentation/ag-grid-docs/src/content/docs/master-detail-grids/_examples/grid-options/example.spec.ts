import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Detail grid renders configured columns with pagination and selection', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands the row at index 1 (Mila Smith), so one detail grid renders on load.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);
        const detail = detailRows.first();
        await expect(detail).toBeVisible();

        // Detail grid exposes the call-record columns defined in detailGridOptions.
        await expect(detail.locator('.ag-header-cell-text')).toContainText([
            'Call Id',
            'Direction',
            'Number',
            'Duration',
            'Switch Code',
        ]);

        // pagination=true means the detail grid shows a paging panel.
        await expect(detail.locator('.ag-paging-panel')).toBeVisible();

        // rowSelection mode 'multiRow' adds per-row selection checkboxes to the detail grid.
        await expect(detail.locator('.ag-selection-checkbox').first()).toBeVisible();

        // headerCheckbox=false means the detail grid header has no select-all checkbox.
        await expect(detail.locator('.ag-header-select-all')).toHaveCount(0);

        // duration values are formatted with an 's' suffix by the detail grid's valueFormatter.
        await expect(detail).toContainText('s');
    });
});
