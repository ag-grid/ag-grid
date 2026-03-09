import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    if (process.env.PRE_34_VERSION) {
        test.skip();
        return;
    }

    test.eachFramework('Grid loads with expected data', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('0', 'firstName');
        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveText('Bob');

        const batchStatus = page.locator('#batchStatusValue');
        await expect(batchStatus).toHaveText('Inactive');
    });

    test.eachFramework('Start batch, edit full row, commit persists value', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('1', 'firstName');
        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveText('Jane');

        // Start batch editing
        await page.locator('button', { hasText: 'Start Batch' }).click();
        const batchStatus = page.locator('#batchStatusValue');
        await expect(batchStatus).toContainText('Active');

        // Double-click to open full-row editor on row 1
        await firstNameCell.dblclick();
        const cellEditor = firstNameCell.locator('input');
        await expect(cellEditor).toBeVisible();

        // Type a new value and close the editor
        await cellEditor.fill('');
        await page.keyboard.type('Alice');
        await page.keyboard.press('Enter');

        // Verify editor closed and value updated
        await expect(cellEditor).toHaveCount(0);
        await expect(firstNameCell).toHaveText('Alice');

        // Row should have batch edit styling
        const row1 = agIdFor.rowNode('1');
        await expect(row1).toHaveClass(/ag-row-batch-edit/);

        // Commit the batch
        await page.locator('button', { hasText: 'Commit Batch' }).click();

        // Batch styling removed after commit
        await expect(row1).not.toHaveClass(/ag-row-batch-edit/);

        // Value persists after commit
        await expect(firstNameCell).toHaveText('Alice');

        // Status returns to inactive
        await expect(batchStatus).toHaveText('Inactive');
    });

    test.eachFramework('Cancel batch reverts edited value', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('0', 'firstName');
        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveText('Bob');

        // Start batch editing
        await page.locator('button', { hasText: 'Start Batch' }).click();

        // Double-click to open full-row editor on row 0
        await firstNameCell.dblclick();
        const cellEditor = firstNameCell.locator('input');
        await expect(cellEditor).toBeVisible();

        // Type a new value and close the editor
        await cellEditor.fill('');
        await page.keyboard.type('ChangedName');
        await page.keyboard.press('Enter');

        // Verify the edit was applied locally
        await expect(cellEditor).toHaveCount(0);
        await expect(firstNameCell).toHaveText('ChangedName');

        const row0 = agIdFor.rowNode('0');
        await expect(row0).toHaveClass(/ag-row-batch-edit/);

        // Cancel the batch
        await page.locator('button', { hasText: 'Cancel Batch' }).click();

        // Value reverts to original
        await expect(firstNameCell).toHaveText('Bob');

        // Batch styling removed after cancel
        await expect(row0).not.toHaveClass(/ag-row-batch-edit/);

        // Status returns to inactive
        const batchStatus = page.locator('#batchStatusValue');
        await expect(batchStatus).toHaveText('Inactive');
    });
});
