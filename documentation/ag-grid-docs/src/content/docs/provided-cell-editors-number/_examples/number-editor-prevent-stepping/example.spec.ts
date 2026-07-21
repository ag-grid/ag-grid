import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // agNumberCellEditor with preventStepping: true. Data is the row index, so cell '5' starts at 5.
    test.eachFramework('the up/down arrow keys do not change the value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('5', 'number');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await expect(editInput(page)).toHaveValue('5');

        // Stepping is prevented, so the arrow keys leave the value untouched.
        await editInput(page).press('ArrowUp');
        await expect(editInput(page)).toHaveValue('5');
        await editInput(page).press('ArrowDown');
        await expect(editInput(page)).toHaveValue('5');

        await editInput(page).press('Enter');
        await expect(cell).toContainText('5');
    });

    test.eachFramework('a typed value can still be committed', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('5', 'number');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();

        await editInput(page).fill('37');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('37');
    });
});
