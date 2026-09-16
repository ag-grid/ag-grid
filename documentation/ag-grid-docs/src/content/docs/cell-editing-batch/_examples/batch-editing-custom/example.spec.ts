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
    test.eachFramework(
        'Rich Select column renderer shows the pending gender during a batch',
        async ({ page, agIdFor }) => {
            // Documented claim: custom cell renderers receive the updated value during a batch, so the
            // GenderRenderer output must follow the pending value rather than the committed data.
            const genderCell = agIdFor.cell('0', 'gender');
            await expect(genderCell).toBeVisible();
            await expect(genderCell).toContainText('Male');

            await page.locator('button', { hasText: 'Start Batch' }).click();
            await expect(page.locator('#batchStatusValue')).toHaveText('Active');

            await genderCell.dblclick();
            const richSelectList = page.locator('.ag-rich-select-list').first();
            await expect(richSelectList).toBeVisible();
            await richSelectList.locator('.ag-rich-select-row', { hasText: 'Female' }).first().click();

            // The renderer re-rendered with the pending value, and the cell is marked pending.
            await expect(genderCell).toContainText('Female');
            await expect(genderCell).toHaveClass(/ag-cell-batch-edit/);

            // Cancelling discards the pending value and the renderer falls back to the committed data.
            await page.locator('button', { hasText: 'Cancel Batch' }).click();
            await expect(genderCell).toContainText('Male');
            await expect(genderCell).not.toHaveClass(/ag-cell-batch-edit/);
            await expect(page.locator('#batchStatusValue')).toHaveText('Inactive');
        }
    );

    test.eachFramework('Popup mood editor updates the custom renderer during a batch', async ({ page, agIdFor }) => {
        // The mood column pairs a custom popup editor with a custom renderer; the renderer must show
        // the pending mood while the batch is open.
        const moodCell = agIdFor.cell('0', 'mood');
        await expect(moodCell).toBeVisible();
        await expect(moodCell.locator('img')).toHaveAttribute('src', /happy\.png/);

        await page.locator('button', { hasText: 'Start Batch' }).click();

        await moodCell.dblclick();
        // The editor is a popup, so it renders outside the cell.
        const popupEditor = page.locator('.ag-popup-editor');
        await expect(popupEditor).toBeVisible();
        await popupEditor.locator('img[src*="sad.png"]').first().click();

        await expect(popupEditor).toHaveCount(0);
        await expect(moodCell.locator('img')).toHaveAttribute('src', /sad\.png/);
        await expect(moodCell).toHaveClass(/ag-cell-batch-edit/);

        // Cancelling reverts the renderer to the committed mood.
        await page.locator('button', { hasText: 'Cancel Batch' }).click();
        await expect(moodCell.locator('img')).toHaveAttribute('src', /happy\.png/);
        await expect(moodCell).not.toHaveClass(/ag-cell-batch-edit/);
    });

    test.eachFramework('Committing a batch keeps the custom renderer values', async ({ page, agIdFor }) => {
        const genderCell = agIdFor.cell('0', 'gender');
        const moodCell = agIdFor.cell('0', 'mood');
        await expect(genderCell).toBeVisible();

        await page.locator('button', { hasText: 'Start Batch' }).click();

        await genderCell.dblclick();
        const richSelectList = page.locator('.ag-rich-select-list').first();
        await expect(richSelectList).toBeVisible();
        await richSelectList.locator('.ag-rich-select-row', { hasText: 'Female' }).first().click();

        await moodCell.dblclick();
        const popupEditor = page.locator('.ag-popup-editor');
        await expect(popupEditor).toBeVisible();
        await popupEditor.locator('img[src*="sad.png"]').first().click();
        await expect(popupEditor).toHaveCount(0);

        await page.locator('button', { hasText: 'Commit Batch' }).click();

        await expect(genderCell).toContainText('Female');
        await expect(moodCell.locator('img')).toHaveAttribute('src', /sad\.png/);
        await expect(genderCell).not.toHaveClass(/ag-cell-batch-edit/);
        await expect(moodCell).not.toHaveClass(/ag-cell-batch-edit/);
    });
});
