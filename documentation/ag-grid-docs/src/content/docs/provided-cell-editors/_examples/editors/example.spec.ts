import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

import { colors } from './colors';

const inlineInput = (page: any) => page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();
const selectWrapper = (page: any) => page.locator('.ag-cell-edit-wrapper .ag-picker-field-wrapper').first();
const selectItems = (page: any) => page.locator('.ag-select-list .ag-list-item');
const richList = (page: any) => page.locator('.ag-rich-select-list').first();
const richInput = (page: any) => page.locator('.ag-rich-select-field-input .ag-input-field-input').first();
const textArea = (page: any) => page.locator('.ag-large-text textarea').first();

// The colour columns are seeded with a random colour name, so no starting value is ever asserted.
// The description column is a fixed Lorem ipsum string.
const LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

test.agExample(import.meta, () => {
    // Docs: "Text Cell Editor - simple text editor that uses the standard HTML input",
    // configured here with ITextCellEditorParams maxLength: 20.
    test.eachFramework('the Text Cell Editor column uses a text input with maxLength 20', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'color1');
        await cell.dblclick();

        await expect(inlineInput(page)).toBeVisible();
        await expect(inlineInput(page)).toHaveAttribute('type', 'text');
        await expect(inlineInput(page)).toHaveAttribute('maxlength', '20');

        await inlineInput(page).fill('Turquoise');
        await inlineInput(page).press('Enter');

        await expect(cell).toContainText('Turquoise');
    });

    // Docs: "Select Cell Editor" - agSelectCellEditor over the colours list.
    // As per the Select Cell Editor docs, editing needs two interactions: double click, then a
    // single click to open the list.
    test.eachFramework('the Select Cell Editor column opens a list of the colour values', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'color2').dblclick();
        await expect(selectWrapper(page)).toBeVisible();

        await selectWrapper(page).click();

        // The list is populated from cellEditorParams.values. It is virtualised and opens scrolled
        // to the cell's own colour, which is randomised, so only the rendered window is asserted:
        // every visible entry is one of the colour names from the list.
        await expect(selectItems(page).first()).toBeVisible();
        for (const text of await selectItems(page).allInnerTexts()) {
            expect(colors).toContain(text.trim());
        }
    });

    test.eachFramework('the Select Cell Editor commits the chosen colour', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'color2');
        await cell.dblclick();
        await expect(selectWrapper(page)).toBeVisible();

        await selectWrapper(page).click();

        // Pick whichever entry the virtualised list has rendered first, rather than a fixed colour.
        const option = selectItems(page).first();
        const chosen = (await option.innerText()).trim();
        await option.click();
        await page.keyboard.press('Enter');

        await expect(cell).toContainText(chosen);
    });

    // Docs: "Rich Select Cell Editor" (enterprise). This column sets allowTyping: true, so the
    // editor exposes a text input rather than a plain list.
    test.eachFramework('the Rich Select Cell Editor opens a list and allows typing', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'color3').dblclick();

        await expect(richList(page)).toBeVisible();
        // allowTyping: true renders the editable input inside the rich select field.
        await expect(richInput(page)).toBeVisible();

        await page.keyboard.press('Escape');
    });

    // filterList: true with searchType: 'match' filters the list down to prefix matches.
    test.eachFramework('the Rich Select Cell Editor filters the list by prefix match', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'color3').dblclick();
        await expect(richList(page)).toBeVisible();

        await richInput(page).fill('Aquam');

        // 'Aquamarine' starts with the search text, so it survives the filter.
        await expect(richList(page).locator('.ag-rich-select-row', { hasText: 'Aquamarine' }).first()).toBeVisible();
        // 'AliceBlue' does not start with it, so filterList removes it.
        await expect(richList(page).locator('.ag-rich-select-row', { hasText: 'AliceBlue' })).toHaveCount(0);

        await page.keyboard.press('Escape');
    });

    test.eachFramework('the Rich Select Cell Editor commits the chosen colour', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'color3');
        await cell.dblclick();
        await expect(richList(page)).toBeVisible();

        await richInput(page).fill('Aquamarine');
        await richList(page).locator('.ag-rich-select-row', { hasText: 'Aquamarine' }).first().click();

        await expect(cell).toContainText('Aquamarine');
    });

    // Docs: "Large Text Cell Editor" - a textarea shown as a popup, configured here with
    // maxLength: 250, rows: 10 and cols: 50.
    test.eachFramework('the Large Text Cell Editor opens a configured popup textarea', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'description');
        // The description value is a fixed Lorem ipsum string.
        await expect(cell).toContainText(LOREM);

        await cell.dblclick();

        await expect(textArea(page)).toBeVisible();
        await expect(textArea(page)).toHaveAttribute('maxlength', '250');
        await expect(textArea(page)).toHaveAttribute('rows', '10');
        await expect(textArea(page)).toHaveAttribute('cols', '50');
        // cellEditorPopup: true renders the editor in a popup rather than inline in the cell.
        await expect(page.locator('.ag-popup-editor .ag-large-text')).toHaveCount(1);
        await expect(cell.locator('.ag-large-text')).toHaveCount(0);

        // The editor is seeded with the current cell value.
        await expect(textArea(page)).toHaveValue(LOREM);
    });

    test.eachFramework('the Large Text Cell Editor commits a new value', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const cell = agIdFor.cell('0', 'description');
        await cell.dblclick();
        await expect(textArea(page)).toBeVisible();

        await textArea(page).fill('An updated description.');
        await textArea(page).press('Enter');

        await expect(cell).toContainText('An updated description.');
    });
});
