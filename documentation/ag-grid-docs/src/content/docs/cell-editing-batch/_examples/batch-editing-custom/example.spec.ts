import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    if (process.env.PRE_34_VERSION) {
        test.skip();
        return;
    }

    test.eachFramework('Grid loads with initial data', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('0', 'first_name');
        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveText('Bob');

        const batchStatus = page.locator('#batchStatusValue');
        await expect(batchStatus).toHaveText('Inactive');
    });

    test.eachFramework('Start batch, edit text, and commit', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('0', 'first_name');
        await expect(firstNameCell).toBeVisible();

        // Start batch editing
        await page.locator('button', { hasText: 'Start Batch' }).click();
        await expect(page.locator('#batchStatusValue')).toHaveText('Active');

        // Double-click to edit first_name cell
        await firstNameCell.dblclick();
        const cellEditor = firstNameCell.locator('input');
        await expect(cellEditor).toBeVisible();

        // Clear existing value and type new name
        await cellEditor.fill('Alice');
        await page.keyboard.press('Enter');

        // Verify edit is pending in batch
        await expect(cellEditor).toHaveCount(0);
        await expect(firstNameCell).toHaveText('Alice');
        await expect(firstNameCell).toHaveClass(/ag-cell-batch-edit/);

        // Commit the batch
        await page.locator('button', { hasText: 'Commit Batch' }).click();

        // Verify value persists and batch styling is removed
        await expect(firstNameCell).toHaveText('Alice');
        await expect(firstNameCell).not.toHaveClass(/ag-cell-batch-edit/);
        await expect(page.locator('#batchStatusValue')).toHaveText('Inactive');
    });

    test.eachFramework('Start batch, edit text, and cancel reverts value', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('0', 'first_name');
        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveText('Bob');

        // Start batch editing
        await page.locator('button', { hasText: 'Start Batch' }).click();

        // Double-click to edit first_name cell
        await firstNameCell.dblclick();
        const cellEditor = firstNameCell.locator('input');
        await expect(cellEditor).toBeVisible();

        // Clear existing value and type new name
        await cellEditor.fill('Alice');
        await page.keyboard.press('Enter');

        // Verify edit is pending in batch
        await expect(cellEditor).toHaveCount(0);
        await expect(firstNameCell).toHaveText('Alice');
        await expect(firstNameCell).toHaveClass(/ag-cell-batch-edit/);

        // Cancel the batch
        await page.locator('button', { hasText: 'Cancel Batch' }).click();

        // Verify value reverts and batch styling is removed
        await expect(firstNameCell).toHaveText('Bob');
        await expect(firstNameCell).not.toHaveClass(/ag-cell-batch-edit/);
        await expect(page.locator('#batchStatusValue')).toHaveText('Inactive');
    });

    test.eachFramework('Edit custom SimpleTextEditor column in batch', async ({ page, agIdFor }) => {
        const lastNameCell = agIdFor.cell('0', 'last_name');
        await expect(lastNameCell).toBeVisible();

        // Start batch editing
        await page.locator('button', { hasText: 'Start Batch' }).click();

        // Double-click to edit last_name cell (uses SimpleTextEditor)
        await lastNameCell.dblclick();
        const cellEditor = lastNameCell.locator('input');
        await expect(cellEditor).toBeVisible();

        await cellEditor.fill('Cooper');
        await page.keyboard.press('Enter');

        // Verify edit is pending in batch
        await expect(cellEditor).toHaveCount(0);
        await expect(lastNameCell).toHaveText('Cooper');
        await expect(lastNameCell).toHaveClass(/ag-cell-batch-edit/);

        // Commit and verify
        await page.locator('button', { hasText: 'Commit Batch' }).click();
        await expect(lastNameCell).toHaveText('Cooper');
        await expect(lastNameCell).not.toHaveClass(/ag-cell-batch-edit/);
    });
});
