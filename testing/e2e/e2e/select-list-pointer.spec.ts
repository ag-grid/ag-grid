import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

const openLongList = async (page: Page) => {
    const { cell } = await mountGrid(page, {
        options: () => ({
            columnDefs: [
                {
                    field: 'country',
                    editable: true,
                    cellEditor: 'agSelectCellEditor',
                    cellEditorParams: {
                        values: Array.from({ length: 26 }, (_, i) => `${String.fromCharCode(65 + i)} country`),
                        valueListMaxHeight: 150,
                    },
                },
            ],
            rowData: [{ country: 'A country' }],
        }),
    });
    await cell(0, 'country').dblclick();
    await page.keyboard.press('Enter');
    return page.locator('.ag-list-item.ag-active-item');
};

const movePointerOver = async (page: Page, target: Locator) => {
    const box = (await target.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 3 });
};

test.describe('select list under a still pointer', () => {
    test('keeps the option reached by typing when the list scrolls', async ({ page }) => {
        const highlighted = await openLongList(page);
        await expect(highlighted).toHaveText('A country');

        await movePointerOver(page, page.locator('.ag-list-item').nth(2));
        await expect(highlighted).toHaveText('C country');

        await page.keyboard.press('z');
        await expect(highlighted).toHaveText('Z country');

        // The window in which the browser would report a hover for the scrolled list.
        await page.waitForTimeout(300);
        await expect(highlighted).toHaveText('Z country');

        await page.keyboard.press('Enter');
        await expect(page.locator('.ag-cell[col-id="country"]')).toHaveText('Z country');
    });

    test('follows the pointer again once it moves after typing', async ({ page }) => {
        const highlighted = await openLongList(page);
        await movePointerOver(page, page.locator('.ag-list-item').nth(2));

        await page.keyboard.press('z');
        await expect(highlighted).toHaveText('Z country');

        await movePointerOver(page, page.locator('.ag-list-item').nth(24));
        await expect(highlighted).toHaveText('Y country');
    });

    test('keeps the current value highlighted when the list opens', async ({ page }) => {
        const highlighted = await openLongList(page);
        await movePointerOver(page, page.locator('.ag-list-item').nth(2));
        await expect(highlighted).toHaveText('C country');

        await page.keyboard.press('Escape');
        await page.keyboard.press('Enter');

        // The window in which the browser would report a hover for the opened list.
        await page.waitForTimeout(300);
        await expect(highlighted).toHaveText('A country');
    });
});
