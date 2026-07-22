import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // agNumberCellEditor with min: 0, max: 100. Data is the row index, so cell '5' starts at 5.
    test.eachFramework('double-click shows a number input with the configured min/max', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('5', 'number').dblclick();

        await expect(editInput(page)).toBeVisible();
        await expect(editInput(page)).toHaveAttribute('type', 'number');
        await expect(editInput(page)).toHaveAttribute('min', '0');
        await expect(editInput(page)).toHaveAttribute('max', '100');
    });

    test.eachFramework('commits a new numeric value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('5', 'number');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();

        await editInput(page).fill('42');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('42');
    });

    test.eachFramework('the up/down arrow keys step the value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Cell '5' starts at 5. Pressing the up arrow steps it to 6.
        const cell = agIdFor.cell('5', 'number');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();

        await editInput(page).press('ArrowUp');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('6');
    });
});
