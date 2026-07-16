import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // getRowId uses the account, so row ids are the account numbers.
    const NORA = '177000';
    const MILA = '177001';

    test.eachFramework('Row with no call records is not a master row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Nora Thomas has no detail records, so isRowMaster returns false: the cell is not expandable.
        await expect(agIdFor.cell(NORA, 'name')).toContainText('Nora Thomas');
        await expect(agIdFor.cell(NORA, 'name').locator('.ag-cell-expandable')).toHaveCount(0);

        // Mila Smith has detail records, so it is a master row (auto-expanded by onFirstDataRendered).
        await expect(agIdFor.cell(MILA, 'name')).toContainText('Mila Smith');
        await expect(agIdFor.cell(MILA, 'name').locator('.ag-cell-expandable')).toBeVisible();
        await expect(agIdFor.groupExpanded(MILA, 'name')).toBeVisible();
        await expect(page.locator('.ag-details-row')).toHaveCount(1);
    });

    test.eachFramework('Clearing calls via transaction makes the row non-expandable', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Mila starts expandable with a detail grid open.
        await expect(agIdFor.cell(MILA, 'name').locator('.ag-cell-expandable')).toBeVisible();
        await expect(page.locator('.ag-details-row')).toHaveCount(1);

        // Clearing Mila's calls updates the row; isRowMaster is re-called and now returns false.
        await page.getByRole('button', { name: 'Clear Mila Calls' }).click();
        await expect(agIdFor.cell(MILA, 'name').locator('.ag-cell-expandable')).toHaveCount(0);
        await expect(page.locator('.ag-details-row')).toHaveCount(0);

        // Setting Mila's calls again makes the row a master row once more.
        await page.getByRole('button', { name: 'Set Mila Calls' }).click();
        await expect(agIdFor.cell(MILA, 'name').locator('.ag-cell-expandable')).toBeVisible();
    });
});
