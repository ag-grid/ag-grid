import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Click selection is preserved across filtering', async ({ page }) => {
        await waitForGridContent(page);

        // Wait for the first server-side block to load, then select a leaf row by
        // clicking it (rowSelection mode is 'multiRow').
        const firstRow = page.locator('.ag-row[row-id^="leaf-"]').first();
        await expect(firstRow).toBeVisible();
        const rowId = await firstRow.getAttribute('row-id');
        expect(rowId).toBeTruthy();

        await firstRow.locator('.ag-cell').first().click();
        const selectedRow = page.locator(`.ag-row[row-id="${rowId}"]`).first();
        await expect(selectedRow).toHaveClass(/ag-row-selected/);

        // Apply a filter that matches nothing, emptying the grid of data rows.
        const countryFilter = page.locator('.ag-floating-filter[col-id="country"] input').first();
        await countryFilter.fill('no-such-country');
        await expect(page.locator('.ag-row[row-id^="leaf-"]')).toHaveCount(0);

        // Remove the filter — the row returns and its selection is preserved.
        await countryFilter.fill('');
        const rowAfterClear = page.locator(`.ag-row[row-id="${rowId}"]`).first();
        await expect(rowAfterClear).toBeVisible();
        await expect(rowAfterClear).toHaveClass(/ag-row-selected/);
    });
});
