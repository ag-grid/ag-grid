import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // Both columns use the default agTextCellEditor (standard HTML text input) with maxLength: 20.
    // The 'value' column additionally formats the committed value as "£ {value}".
    test.eachFramework('double-click shows the text editor and commits a new value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'color');
        await cell.dblclick();

        // The default editor is a standard text input.
        await expect(editInput(page)).toBeVisible();
        await expect(editInput(page)).toHaveAttribute('type', 'text');

        await editInput(page).fill('Turquoise');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('Turquoise');
    });

    test.eachFramework('the value column commits through its £ value formatter', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'value');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();

        await editInput(page).fill('500');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('£ 500');
    });

    test.eachFramework('maxLength restricts input to 20 characters', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'color');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();

        // maxLength: 20 is applied as the input's maxlength attribute.
        await expect(editInput(page)).toHaveAttribute('maxlength', '20');

        // Typing 26 characters is truncated to the first 20 by the browser.
        await editInput(page).pressSequentially('abcdefghijklmnopqrstuvwxyz');
        await expect(editInput(page)).toHaveValue('abcdefghijklmnopqrst');

        await editInput(page).press('Enter');
        await expect(cell).toContainText('abcdefghijklmnopqrst');
    });
});
