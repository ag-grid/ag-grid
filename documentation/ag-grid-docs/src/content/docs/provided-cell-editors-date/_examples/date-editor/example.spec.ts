import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // agDateCellEditor over Date cell values. Data is new Date(2023, 5, index + 1), formatted YYYY-MM-DD.
    test.eachFramework('displays the formatted source date', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await expect(agIdFor.cell('0', 'date')).toContainText('2023-06-01');
    });

    test.eachFramework('double-click shows a date input and commits a new date', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'date');
        await cell.dblclick();

        // The Date Cell Editor uses a standard HTML date input.
        await expect(editInput(page)).toBeVisible();
        await expect(editInput(page)).toHaveAttribute('type', 'date');

        await editInput(page).fill('2015-06-15');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('2015-06-15');
    });
});
