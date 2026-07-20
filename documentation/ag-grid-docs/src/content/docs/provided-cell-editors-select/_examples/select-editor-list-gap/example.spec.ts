import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const editWrapper = (page: any) => page.locator('.ag-cell-edit-wrapper .ag-picker-field-wrapper').first();
const listItems = (page: any) => page.locator('.ag-select-list .ag-list-item');
const list = (page: any) => page.locator('.ag-select-list').first();

test.agExample(import.meta, () => {
    // agSelectCellEditor with valueListGap: 10 - the popup opens 10px below the editor input.
    test.eachFramework('the popup opens at a gap below the editor and still selects', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'language');
        await cell.dblclick();
        await expect(editWrapper(page)).toBeVisible();

        await editWrapper(page).click();
        await expect(list(page)).toBeVisible();

        // The list is offset below the editor by roughly valueListGap (10px).
        const wrapperBox = await editWrapper(page).boundingBox();
        const listBox = await list(page).boundingBox();
        const gap = listBox!.y - (wrapperBox!.y + wrapperBox!.height);
        expect(gap).toBeGreaterThanOrEqual(6);
        expect(gap).toBeLessThanOrEqual(16);

        // The offset popup remains functional.
        await listItems(page).filter({ hasText: 'Portuguese' }).click();
        await page.keyboard.press('Enter');
        await expect(cell).toContainText('Portuguese');
    });
});
