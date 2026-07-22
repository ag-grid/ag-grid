import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('All master rows are expanded and flash buttons flash detail cells', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands every master row, so a detail grid renders for each of the 5 accounts.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(5);

        // 'Flash Mila Smith' uses getDetailGridInfo('detail_177001') to flash only Mila's detail grid.
        // getRowId uses the account attribute, and Mila (account 177001) is the row at index 1.
        const milaDetail = detailRows.nth(1);
        await page.getByRole('button', { name: 'Flash Mila Smith' }).click();
        await expect(milaDetail.locator('.ag-cell-data-changed').first()).toBeVisible();

        // Only Mila's detail grid flashed - the first account's detail grid has no flashed cells.
        await expect(detailRows.nth(0).locator('.ag-cell-data-changed')).toHaveCount(0);

        // 'Flash All' uses forEachDetailGridInfo to flash every detail grid.
        await page.getByRole('button', { name: 'Flash All' }).click();
        await expect(detailRows.nth(0).locator('.ag-cell-data-changed').first()).toBeVisible();
        await expect(detailRows.nth(4).locator('.ag-cell-data-changed').first()).toBeVisible();
    });
});
