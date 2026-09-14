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
    test.eachFramework('Starting an edit opens every editable cell in the row', async ({ page, agIdFor }) => {
        // Documented claim: "In Full Row Batch Editing, starting an edit in any cell opens all editors
        // for the current row." The country column is `editable: false` so it must stay a plain cell.
        const firstNameCell = agIdFor.cell('1', 'firstName');
        await expect(firstNameCell).toBeVisible();

        await page.locator('button', { hasText: 'Start Batch' }).click();
        await firstNameCell.dblclick();

        for (const colId of ['firstName', 'lastName', 'gender', 'age', 'mood', 'address']) {
            await expect(agIdFor.cell('1', colId).locator('input')).toBeVisible();
        }
        await expect(agIdFor.cell('1', 'country').locator('input')).toHaveCount(0);

        // Only the current row is opened.
        await expect(agIdFor.cell('0', 'firstName').locator('input')).toHaveCount(0);
    });

    test.eachFramework('Only changed cells join the pending batch', async ({ page, agIdFor }) => {
        // Documented claim: "When row editing is completed, only the changed cells are included in the
        // pending batch edits" - even though an editor was opened for every cell in the row.
        const firstNameCell = agIdFor.cell('1', 'firstName');
        await expect(firstNameCell).toBeVisible();
        await expect(firstNameCell).toHaveText('Jane');

        await page.locator('button', { hasText: 'Start Batch' }).click();
        await firstNameCell.dblclick();

        const firstNameEditor = firstNameCell.locator('input');
        await expect(firstNameEditor).toBeVisible();
        await firstNameEditor.fill('Alice');
        await page.keyboard.press('Enter');

        await expect(firstNameEditor).toHaveCount(0);
        await expect(firstNameCell).toHaveText('Alice');
        await expect(firstNameCell).toHaveClass(/ag-cell-batch-edit/);

        // Every other editor in the row was opened and closed untouched, so none of them are pending.
        for (const colId of ['lastName', 'gender', 'age', 'mood', 'address']) {
            await expect(agIdFor.cell('1', colId)).not.toHaveClass(/ag-cell-batch-edit/);
        }

        // The row itself is still flagged as having pending edits.
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-batch-edit/);
    });

    test.eachFramework('Several cells changed in one row all become pending', async ({ page, agIdFor }) => {
        const firstNameCell = agIdFor.cell('1', 'firstName');
        const ageCell = agIdFor.cell('1', 'age');
        const moodCell = agIdFor.cell('1', 'mood');
        await expect(firstNameCell).toBeVisible();

        await page.locator('button', { hasText: 'Start Batch' }).click();
        await firstNameCell.dblclick();
        await expect(firstNameCell.locator('input')).toBeVisible();

        await firstNameCell.locator('input').fill('Alice');
        await ageCell.locator('input').fill('31');
        await moodCell.locator('input').fill('Happy');
        await page.keyboard.press('Enter');

        await expect(firstNameCell).toHaveText('Alice');
        await expect(ageCell).toHaveText('31');
        await expect(moodCell).toHaveText('Happy');
        for (const cell of [firstNameCell, ageCell, moodCell]) {
            await expect(cell).toHaveClass(/ag-cell-batch-edit/);
        }
        // Untouched cells in the same row stay out of the batch.
        await expect(agIdFor.cell('1', 'lastName')).not.toHaveClass(/ag-cell-batch-edit/);

        await page.locator('button', { hasText: 'Commit Batch' }).click();
        await expect(firstNameCell).toHaveText('Alice');
        await expect(ageCell).toHaveText('31');
        await expect(moodCell).toHaveText('Happy');
        await expect(firstNameCell).not.toHaveClass(/ag-cell-batch-edit/);
    });

    test.eachFramework('One batch collects edits made across several rows', async ({ page, agIdFor }) => {
        // Documented claim: "Batch editing lets you queue edits across multiple cells or rows, then
        // commit or discard them all at once."
        const row1Cell = agIdFor.cell('1', 'firstName');
        const row3Cell = agIdFor.cell('3', 'firstName');
        await expect(row1Cell).toBeVisible();

        await page.locator('button', { hasText: 'Start Batch' }).click();

        await row1Cell.dblclick();
        await expect(row1Cell.locator('input')).toBeVisible();
        await row1Cell.locator('input').fill('Alice');
        await page.keyboard.press('Enter');

        await row3Cell.dblclick();
        await expect(row3Cell.locator('input')).toBeVisible();
        await row3Cell.locator('input').fill('Carol');
        await page.keyboard.press('Enter');

        // Both rows hold pending values at the same time.
        await expect(row1Cell).toHaveText('Alice');
        await expect(row3Cell).toHaveText('Carol');
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-batch-edit/);
        await expect(agIdFor.rowNode('3')).toHaveClass(/ag-row-batch-edit/);

        // One commit applies both rows.
        await page.locator('button', { hasText: 'Commit Batch' }).click();
        await expect(row1Cell).toHaveText('Alice');
        await expect(row3Cell).toHaveText('Carol');
        await expect(agIdFor.rowNode('1')).not.toHaveClass(/ag-row-batch-edit/);
        await expect(agIdFor.rowNode('3')).not.toHaveClass(/ag-row-batch-edit/);
        await expect(page.locator('#batchStatusValue')).toHaveText('Inactive');
    });
});
