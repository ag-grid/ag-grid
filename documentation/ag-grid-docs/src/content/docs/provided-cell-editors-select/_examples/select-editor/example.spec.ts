import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

const LANGUAGES = ['English', 'Spanish', 'French', 'Portuguese', '(other)'];

const editWrapper = (page: any) => page.locator('.ag-cell-edit-wrapper .ag-picker-field-wrapper').first();
const listItems = (page: any) => page.locator('.ag-select-list .ag-list-item');

test.agExample(import.meta, () => {
    // agSelectCellEditor (standard HTML-style select). Note from the docs: editing takes two
    // interactions - double-click to start editing, then a single click to open the list.
    test.eachFramework('opening the select shows all configured options', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'language').dblclick();
        await expect(editWrapper(page)).toBeVisible();

        await editWrapper(page).click();

        await expect(listItems(page)).toHaveCount(LANGUAGES.length);
        for (const language of LANGUAGES) {
            await expect(listItems(page).filter({ hasText: language })).toHaveCount(1);
        }
    });

    test.eachFramework('selecting an option commits it to the cell', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'language');
        await cell.dblclick();
        await expect(editWrapper(page)).toBeVisible();

        await editWrapper(page).click();
        await listItems(page).filter({ hasText: 'French' }).click();
        await page.keyboard.press('Enter');

        await expect(cell).toContainText('French');
    });
});
