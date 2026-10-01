import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

import type { GridOptions } from 'ag-grid-community';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    let gridOptions: GridOptions;

    test.beforeEach(() => {
        gridOptions = {
            columnDefs: [
                { field: 'string', cellEditor: 'agTextCellEditor', editable: true },
                { field: 'number', cellEditor: 'agNumberCellEditor', editable: true },
            ],
            rowData: [{ string: 'red', number: 123 }],
        };
    });

    // AG-14947 - Safari doesn't focus string input fields when typing-to-start editing
    [
        { field: 'string', testInput: 'G' },
        { field: 'number', testInput: '1' },
    ].forEach(({ field, testInput }) => {
        test.vanilla(`click-type-edit ${field}`, async ({ page, agIdFor, remoteGrid }) => {
            const remoteApi = remoteGrid(page, '1');
            await remoteApi.updateGridOptions(gridOptions);

            const cell = agIdFor.cell('0', field);
            await cell.click(); // click the cell to focus it
            await cell.press(testInput); // type in a new value

            const editor = cell.locator('input');
            await expect(editor).toBeVisible();
            await expect(editor).toBeFocused();

            await page.keyboard.press('Escape'); // press Enter to save the value
            await expect(editor).toHaveCount(0); // verify the cell editor is closed
        });
    });

    // The example's own grid: agNumberCellEditor (precision: 0), agDateCellEditor,
    // agDateStringCellEditor and agCheckboxCellEditor over rows indexed 0..19.
    test.eachFramework('the Number Editor column edits with a number input', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Row data is the row index, so row '0' starts at 0.
        const cell = agIdFor.cell('0', 'number');
        await expect(cell).toContainText('0');

        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await expect(editInput(page)).toHaveAttribute('type', 'number');

        await editInput(page).fill('42');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('42');
    });

    // precision: 0 truncates any decimals typed into the editor.
    test.eachFramework('precision 0 truncates decimals in the number editor', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'number');
        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();

        await editInput(page).fill('3.75');
        // The value is truncated (not rounded) to 0 decimal places.
        await expect(editInput(page)).toHaveValue('3');

        await editInput(page).press('Enter');
        await expect(cell).toContainText('3');
    });

    // agDateCellEditor over Date values - new Date(2023, 5, index + 1), formatted YYYY-MM-DD.
    test.eachFramework('the Date Editor column edits with a date input', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'date');
        await expect(cell).toContainText('2023-06-01');

        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await expect(editInput(page)).toHaveAttribute('type', 'date');

        await editInput(page).fill('2015-06-15');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('2015-06-15');
    });

    // agDateStringCellEditor over string values - row '0' is '2023-06-01'.
    test.eachFramework('the Date as String Editor column edits with a date input', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'dateString');
        await expect(cell).toContainText('2023-06-01');

        await cell.dblclick();
        await expect(editInput(page)).toBeVisible();
        await expect(editInput(page)).toHaveAttribute('type', 'date');

        await editInput(page).fill('2015-06-15');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('2015-06-15');
    });

    // agCheckboxCellEditor over boolean values - !!(index % 2), so row '0' is false and row '1' true.
    test.eachFramework('the Checkbox Editor column renders the boolean values', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await expect(agIdFor.cell('0', 'boolean').locator('input[type="checkbox"]')).not.toBeChecked();
        await expect(agIdFor.cell('1', 'boolean').locator('input[type="checkbox"]')).toBeChecked();
    });

    test.eachFramework('the Checkbox Editor column toggles a boolean value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        // Focus the cell away from the rendered checkbox, then start editing with F2.
        const cell = agIdFor.cell('0', 'boolean');
        await cell.click({ position: { x: 100, y: 15 } });
        await page.keyboard.press('F2');

        const editor = page.locator('.ag-checkbox-edit input[type="checkbox"]').first();
        await expect(editor).toBeVisible();
        await expect(editor).not.toBeChecked();

        await page.keyboard.press('Space');
        await page.keyboard.press('Enter');

        await expect(page.locator('.ag-checkbox-edit')).toHaveCount(0);
        await expect(cell.locator('input[type="checkbox"]')).toBeChecked();
    });
});
