import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();

test.agExample(import.meta, () => {
    // agDateStringCellEditor over String cell values (default format YYYY-MM-DD). Row 0 is '2023-06-01'.
    test.eachFramework('displays the source date string', async ({ page, agIdFor }) => {
        await ensureGridReady(page);
        await expect(agIdFor.cell('0', 'dateString')).toContainText('2023-06-01');
    });

    test.eachFramework('double-click shows a date input and commits a new date string', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'dateString');
        await cell.dblclick();

        // The Date as String Cell Editor also uses a standard HTML date input.
        await expect(editInput(page)).toBeVisible();
        await expect(editInput(page)).toHaveAttribute('type', 'date');

        await editInput(page).fill('2015-06-15');
        await editInput(page).press('Enter');

        await expect(cell).toContainText('2015-06-15');
    });
});
