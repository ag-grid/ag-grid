import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    if (process.env.PRE_34_VERSION) {
        test.skip();
        return;
    }

    test.eachFramework('Initial batch state has pending values', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('0', 'firstName');
        const ageCell = agIdFor.cell('1', 'age');

        // Batch auto-starts in onFirstDataRendered with two setDataValue calls
        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveText('Justine');
        await expect(ageCell).toHaveText('101');

        // Pending cells should have the batch-edit CSS class
        await expect(firstNameCell).toHaveClass(/ag-cell-batch-edit/);
        await expect(ageCell).toHaveClass(/ag-cell-batch-edit/);

        // Unchanged cells should not have the batch-edit class
        const lastNameCell = agIdFor.cell('0', 'lastName');
        await expect(lastNameCell).not.toHaveClass(/ag-cell-batch-edit/);

        // Status indicator should reflect active batch
        await expect(page.locator('#batchStatusValue')).toHaveText('Active');
    });

    test.eachFramework('Commit batch applies values and removes styling', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('0', 'firstName');
        const ageCell = agIdFor.cell('1', 'age');

        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveText('Justine');
        await expect(firstNameCell).toHaveClass(/ag-cell-batch-edit/);

        // Commit the batch
        await page.locator('button', { hasText: 'Commit Batch' }).click();

        // Values should persist after commit
        await expect(firstNameCell).toHaveText('Justine');
        await expect(ageCell).toHaveText('101');

        // Batch-edit styling should be removed after commit
        await expect(firstNameCell).not.toHaveClass(/ag-cell-batch-edit/);
        await expect(ageCell).not.toHaveClass(/ag-cell-batch-edit/);

        // Status should show inactive
        await expect(page.locator('#batchStatusValue')).toHaveText('Inactive');
    });

    test.eachFramework('Cancel batch reverts values and removes styling', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('0', 'firstName');
        const ageCell = agIdFor.cell('1', 'age');

        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveText('Justine');
        await expect(ageCell).toHaveText('101');

        // Cancel the batch
        await page.locator('button', { hasText: 'Cancel Batch' }).click();

        // Row 0 firstName should revert to original value
        await expect(firstNameCell).toHaveText('Bob');

        // Row 1 age should revert to original value
        await expect(ageCell).toHaveText('25');

        // Row 0 age cell should be blank (no age in original data)
        const row0AgeCell = agIdFor.cell('0', 'age');
        await expect(row0AgeCell).toHaveText('');

        // Batch-edit styling should be removed after cancel
        await expect(firstNameCell).not.toHaveClass(/ag-cell-batch-edit/);
        await expect(ageCell).not.toHaveClass(/ag-cell-batch-edit/);

        // Status should show inactive
        await expect(page.locator('#batchStatusValue')).toHaveText('Inactive');
    });

    test.eachFramework('Full-row editing applies row batch-edit class', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('0', 'firstName');
        const row0 = agIdFor.rowNode('0');

        await expect(firstNameCell).toBeVisible();

        // Double-click to start full-row editing on row 0
        await firstNameCell.dblclick();
        const cellEditor = firstNameCell.locator('input');
        await expect(cellEditor).toBeVisible();

        // During full-row editing, the row should have the row batch-edit class
        await expect(row0).toHaveClass(/ag-row-batch-edit/);

        // Press Escape to close the editor without additional changes
        await page.keyboard.press('Escape');
        await expect(cellEditor).toHaveCount(0);

        // After editor closes, the changed cell should still have the cell batch-edit class
        await expect(firstNameCell).toHaveClass(/ag-cell-batch-edit/);
    });
});
