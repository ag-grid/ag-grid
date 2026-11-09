import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

/** Drags from the start of the text in `eValue` to the right edge of `eEnd`, past the end of the text. */
async function dragPastEndOfText(page: Page, eValue: Locator, eEnd: Locator = eValue) {
    const textBox = await eValue.evaluate((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const { left, top, height } = range.getBoundingClientRect();
        return { left, y: top + height / 2 };
    });
    const endBox = (await eEnd.boundingBox())!;

    await page.mouse.move(textBox.left + 1, textBox.y);
    await page.mouse.down();
    await page.mouse.move(endBox.x + endBox.width - 4, textBox.y, { steps: 5 });
    await page.mouse.up();
}

const selectedText = (page: Page) => page.evaluate(() => window.getSelection()!.toString());

for (const fullWidth of [false, true]) {
    test(`editable renderer from another window keeps focus when clicked (fullWidth=${fullWidth})`, async ({
        page,
    }) => {
        const { grid } = await mountGrid(page, {
            options: () => {
                const iframe = document.createElement('iframe');
                iframe.hidden = true;
                document.body.appendChild(iframe);
                const renderer = () => {
                    const childDocument = iframe.contentDocument!;
                    const editor = childDocument.createElement('div');
                    editor.setAttribute('contenteditable', '');
                    const text = childDocument.createElement('span');
                    text.textContent = 'Editable name';
                    editor.appendChild(text);
                    for (const eventName of ['pointerdown', 'mousedown']) {
                        editor.addEventListener(eventName, (event) => event.preventDefault());
                    }
                    return editor;
                };
                return {
                    columnDefs: [{ field: 'name', cellRenderer: renderer }],
                    rowData: [{ fullWidth: false }, { fullWidth: true }],
                    enableCellTextSelection: true,
                    isFullWidthRow: ({ rowNode }) => rowNode.data.fullWidth,
                    fullWidthCellRenderer: renderer,
                };
            },
        });
        const editor = grid.locator(`.ag-row[row-index="${fullWidth ? 1 : 0}"] [contenteditable]`);
        expect(await editor.evaluate((element) => element instanceof HTMLElement)).toBe(false);
        await editor.focus();
        await expect(editor).toBeFocused();

        await editor.locator('span').click();

        await expect(editor).toBeFocused();
        await page.keyboard.type('!');
        await expect(editor).toContainText('!');
    });
}

test.describe('enableCellTextSelection', () => {
    test('dragging past the end of a cell value selects only that cell value', async ({ page }) => {
        const { cell } = await mountGrid(page, {
            options: () => ({
                columnDefs: [{ field: 'athlete' }, { field: 'age' }],
                enableCellTextSelection: true,
                ensureDomOrder: true,
                rowData: [
                    { athlete: 'Michael Phelps', age: 19 },
                    { athlete: 'Natalie Coughlin', age: 25 },
                    { athlete: 'Aleksey Nemov', age: 24 },
                ],
            }),
        });

        await dragPastEndOfText(page, cell(2, 'age').locator('.ag-cell-value'));

        expect(await selectedText(page)).toBe('24');
    });

    test('dragging past the end of a row group name selects only that name', async ({ page }) => {
        const { cell } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
                autoGroupColumnDef: { minWidth: 300 },
                groupDefaultExpanded: -1,
                enableCellTextSelection: true,
                ensureDomOrder: true,
                rowData: [
                    { country: 'Ireland', athlete: 'Michael Phelps' },
                    { country: 'Ireland', athlete: 'Natalie Coughlin' },
                    { country: 'Spain', athlete: 'Aleksey Nemov' },
                ],
            }),
        });

        const groupCell = cell(3, 'ag-Grid-AutoColumn');
        await dragPastEndOfText(page, groupCell.locator('.ag-group-value'), groupCell);

        const selected = await selectedText(page);
        expect(selected).toContain('Spain');
        expect(selected).not.toContain('Michael Phelps');
    });
});
