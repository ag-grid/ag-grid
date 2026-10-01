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
    test.eachFramework('Pending cell styling uses the overridden batch-edit colours', async ({ agIdFor }) => {
        // Documented claim: "Pending edit styles can be overridden using CSS, via the .ag-cell-batch-edit
        // and .ag-row-batch-edit classes." styles.css of this example sets concrete colours for both.
        const firstNameCell = agIdFor.cell('0', 'firstName');
        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveClass(/ag-cell-batch-edit/);

        const cellStyles = await firstNameCell.evaluate((el) => {
            const style = getComputedStyle(el);
            return { backgroundColor: style.backgroundColor, color: style.color };
        });
        expect(cellStyles.backgroundColor).toContain('59, 255, 49');
        expect(cellStyles.color).toBe('rgb(196, 137, 101)');

        // A cell with no pending value keeps the theme colours.
        const lastNameCell = agIdFor.cell('0', 'lastName');
        await expect(lastNameCell).not.toHaveClass(/ag-cell-batch-edit/);
        const unchangedBackground = await lastNameCell.evaluate((el) => getComputedStyle(el).backgroundColor);
        expect(unchangedBackground).not.toContain('59, 255, 49');
    });

    test.eachFramework('Row batch-edit styling uses the overridden row colours', async ({ agIdFor, page }) => {
        // .ag-row-batch-edit is applied while a full row is being batch edited.
        const firstNameCell = agIdFor.cell('0', 'firstName');
        const row0 = agIdFor.rowNode('0');
        await expect(firstNameCell).toBeVisible();

        await firstNameCell.dblclick();
        await expect(firstNameCell.locator('input')).toBeVisible();
        await expect(row0).toHaveClass(/ag-row-batch-edit/);

        const rowStyles = await row0.evaluate((el) => {
            const style = getComputedStyle(el);
            return { backgroundColor: style.backgroundColor, color: style.color };
        });
        expect(rowStyles.backgroundColor).toContain('245, 255, 49');
        expect(rowStyles.color).toBe('rgb(130, 134, 0)');

        await page.keyboard.press('Escape');
    });

    test.eachFramework('Commit clears the overridden batch-edit colours', async ({ agIdFor, page }) => {
        const firstNameCell = agIdFor.cell('0', 'firstName');
        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveClass(/ag-cell-batch-edit/);

        await page.locator('button', { hasText: 'Commit Batch' }).click();
        await expect(firstNameCell).not.toHaveClass(/ag-cell-batch-edit/);

        // The custom pending colours are gone once the values are committed.
        const cellStyles = await firstNameCell.evaluate((el) => {
            const style = getComputedStyle(el);
            return { backgroundColor: style.backgroundColor, color: style.color };
        });
        expect(cellStyles.backgroundColor).not.toContain('59, 255, 49');
        expect(cellStyles.color).not.toBe('rgb(196, 137, 101)');
    });
});
