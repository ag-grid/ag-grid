import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editWrapper = (page: any) => page.locator('.ag-cell-edit-wrapper .ag-picker-field-wrapper').first();
const listItems = (page: any) => page.locator('.ag-select-list .ag-list-item');
const list = (page: any) => page.locator('.ag-select-list').first();

test.agExample(import.meta, () => {
    // Two agSelectCellEditor columns over the same 'color' field. The first uses default list sizing;
    // the second sets valueListMaxHeight: 200 and valueListMaxWidth: 150. Duplicate field ids are
    // de-duplicated, so the second column's id is 'color_1'.
    test.eachFramework('the constrained column applies the configured list size', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'color_1').dblclick();
        await expect(editWrapper(page)).toBeVisible();

        await editWrapper(page).click();
        await expect(list(page)).toBeVisible();

        await expect(list(page)).toHaveCSS('max-height', '200px');
        await expect(list(page)).toHaveCSS('width', '150px');
    });

    test.eachFramework('the default column does not constrain the list size', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'color').dblclick();
        await expect(editWrapper(page)).toBeVisible();

        await editWrapper(page).click();
        await expect(list(page)).toBeVisible();

        // The unconstrained list does not pick up the 200px/150px sizing of the constrained column.
        await expect(list(page)).not.toHaveCSS('max-height', '200px');
        await expect(list(page)).not.toHaveCSS('width', '150px');
    });

    test.eachFramework('selecting a colour commits it to the cell', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'color_1');
        await cell.dblclick();
        await expect(editWrapper(page)).toBeVisible();

        await editWrapper(page).click();
        await listItems(page).filter({ hasText: 'AliceBlue' }).click();
        await page.keyboard.press('Enter');

        await expect(cell).toContainText('AliceBlue');
    });
});
