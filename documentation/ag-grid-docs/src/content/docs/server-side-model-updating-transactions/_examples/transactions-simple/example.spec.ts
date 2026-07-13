import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('applyServerSideTransaction adds, updates and removes flat rows', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // The first flat row has getRowId === tradeId === '0'.
        const firstRow = page.locator('.ag-row[row-id="0"]');
        await expect(agIdFor.cell('0', 'tradeId')).toContainText('0');

        // Select the first row (via its selection checkbox) so the transaction buttons act on it.
        await firstRow.locator('.ag-selection-checkbox .ag-checkbox-input').click();
        await expect(firstRow).toHaveClass(/ag-row-selected/);

        // "Update Selected" applies an update transaction that changes the 'current' value.
        const currentCell = agIdFor.cell('0', 'current');
        const before = (await currentCell.textContent())?.trim() ?? '';
        await page.getByRole('button', { name: 'Update Selected' }).click();
        await expect(currentCell).not.toHaveText(before);

        // "Add Above Selected" inserts a new row (tradeId 219, one past the 218 seeded rows)
        // at the selected index, i.e. at the top of the grid.
        await page.getByRole('button', { name: 'Add Above Selected' }).click();
        await expect(agIdFor.cell('219', 'tradeId')).toContainText('219');
        await expect(page.locator('.ag-row[row-index="0"]')).toHaveAttribute('row-id', '219');

        // "Remove Selected" removes the still-selected original first row (node id '0').
        await page.getByRole('button', { name: 'Remove Selected' }).click();
        await expect(page.locator('.ag-row[row-id="0"]')).toHaveCount(0);
    });
});
