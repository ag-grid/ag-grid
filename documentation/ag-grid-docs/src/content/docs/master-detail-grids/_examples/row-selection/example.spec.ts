import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Selecting a master row selects all rows in its detail grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands the row at index 1 (Mila Smith), so one detail grid renders on load.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);
        const detail = detailRows.first();

        // The master and detail grids both have a row with row-id=1. The master row is a level-0 group row
        // rendered before its detail grid in the DOM, so .first() disambiguates it from the detail row.
        const masterRow1 = page.locator('.ag-row[row-id="1"]').first();

        // Select the master row via its selection checkbox.
        await masterRow1.locator('.ag-selection-checkbox .ag-checkbox-input').click();

        // masterSelects='detail' means selecting the master row selects every row in the detail grid.
        await expect(masterRow1).toHaveClass(/ag-row-selected/);
        const detailDataRows = detail.locator('.ag-row');
        const detailSelected = detail.locator('.ag-row.ag-row-selected');
        await expect(detailSelected).toHaveCount(await detailDataRows.count());

        // Deselecting a single detail row puts the master row into the indeterminate state.
        await detail.locator('.ag-row').first().locator('.ag-selection-checkbox .ag-checkbox-input').click();
        await expect(masterRow1.locator('.ag-selection-checkbox .ag-checkbox-input-wrapper')).toHaveClass(
            /ag-indeterminate/
        );
    });
});
