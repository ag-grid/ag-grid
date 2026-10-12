import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

async function mountFormulaEditor(page: Page) {
    const grid = await mountGrid(page, {
        enterprise: true,
        options: () => ({
            cellSelection: true,
            rowNumbers: false,
            invalidEditValueMode: 'block',
            defaultColDef: { editable: true, width: 160 },
            columnDefs: [
                { field: 'a' },
                { field: 'b' },
                {
                    field: 'total',
                    allowFormula: true,
                    cellDataType: false,
                    cellEditorParams: { validateFormulas: true },
                },
                { field: 'other', allowFormula: true, cellDataType: false },
            ],
            rowData: [
                { a: 6, b: 3, total: '=A1+B1', other: '' },
                { a: 10, b: 2, total: '', other: '' },
                { a: 20, b: 4, total: '', other: '' },
            ],
        }),
    });
    await grid.withApi((api) => api.startEditingCell({ rowIndex: 0, colKey: 'total' }));
    const input = grid.cell(0, 'total').locator('textarea');
    await expect(input).toBeVisible();
    await input.focus();
    return { ...grid, input, mirror: grid.cell(0, 'total').locator('.ag-text-area-mirror') };
}

test.describe('formula editor with a native textarea', () => {
    test('typing, selection and undo do not depend on the coloured DOM', async ({ page }) => {
        const { input, mirror, cell } = await mountFormulaEditor(page);
        await expect(input).toHaveValue('=A1+B1');
        await expect(mirror.locator('.ag-formula-token')).toHaveText(['A1', 'B1']);
        await input.press('End');
        await page.keyboard.insertText('+2');
        await expect(input).toHaveValue('=A1+B1+2');
        await expect(mirror).toHaveText('=A1+B1+2');
        await input.press('ControlOrMeta+Z');
        await expect(input).toHaveValue('=A1+B1');
        await input.press('ControlOrMeta+Shift+Z');
        await expect(input).toHaveValue('=A1+B1+2');

        await input.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(1, 3, 'backward'));
        await page.keyboard.insertText('A2');
        await expect(input).toHaveValue('=A2+B1+2');
        expect(await input.evaluate((element: HTMLTextAreaElement) => element.selectionStart)).toBe(3);
        await input.press('Enter');
        await expect(cell(0, 'total')).toHaveText('15');
    });

    test('operator glyphs preserve source text, selection and evaluation', async ({ page }) => {
        const { input, mirror, cell } = await mountFormulaEditor(page);
        await input.fill('=A1*B1/2');
        await expect(mirror.locator('.ag-formula-operator')).toHaveText(['*', '/']);
        await expect(mirror.locator('.ag-formula-operator').nth(0)).toHaveAttribute('data-symbol', '×');
        await expect(mirror.locator('.ag-formula-operator').nth(1)).toHaveAttribute('data-symbol', '÷');
        await input.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(3, 4));
        await page.keyboard.insertText('+');
        await expect(input).toHaveValue('=A1+B1/2');
        await input.press('Enter');
        await expect(cell(0, 'total')).toHaveText('7.5');
    });

    test('function autocomplete accepts Tab without leaving the cell', async ({ page }) => {
        const { input, cell } = await mountFormulaEditor(page);
        await input.fill('=SU');
        await expect(page.locator('.ag-autocomplete-list-popup')).toBeVisible();
        await input.press('Tab');
        await expect(input).toHaveValue('=SUM(');
        await expect(input).toBeFocused();
        await page.keyboard.insertText('A1:B1)');
        await input.press('Enter');
        await expect(cell(0, 'total')).toHaveText('9');
    });

    test('a blocked commit does not insert a newline into the formula', async ({ page }) => {
        const { input, cell } = await mountFormulaEditor(page);
        await input.fill('=A1+');
        await input.press('Enter');
        await expect(input).toBeFocused();
        await expect(input).toHaveValue('=A1+');
        await page.keyboard.insertText('B1');
        await input.press('Enter');
        await expect(input).toHaveCount(0);
        await expect(cell(0, 'total')).toHaveText('9');
    });

    test('composition updates the mirror only after the composition ends', async ({ page }) => {
        const { input, mirror, cell } = await mountFormulaEditor(page);
        await input.dispatchEvent('compositionstart');
        await input.evaluate((element: HTMLTextAreaElement) => {
            element.value = '="北京"';
            element.setSelectionRange(4, 4);
            element.dispatchEvent(
                new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText', isComposing: true })
            );
        });
        await expect(mirror).toHaveText('=A1+B1');
        await input.dispatchEvent('compositionend');
        await expect(input).toHaveValue('="北京"');
        await expect(mirror).toHaveText('="北京"');
        expect(await input.evaluate((element: HTMLTextAreaElement) => element.selectionStart)).toBe(4);
        await input.press('Enter');
        await expect(cell(0, 'total')).toHaveText('北京');
    });

    test('Escape closes autocomplete before cancelling the cell edit', async ({ page }) => {
        const { input, cell } = await mountFormulaEditor(page);
        await input.fill('=SU');
        await expect(page.locator('.ag-autocomplete-list-popup')).toBeVisible();
        await input.press('Escape');
        await expect(page.locator('.ag-autocomplete-list-popup')).toHaveCount(0);
        await expect(input).toBeFocused();
        await input.press('Escape');
        await expect(input).toHaveCount(0);
        await expect(cell(0, 'total')).toHaveText('9');
    });

    for (const key of ['Tab', 'Shift+Tab']) {
        test(`${key} commits without inserting a range reference`, async ({ page }) => {
            const { input, cell, withApi } = await mountFormulaEditor(page);
            await input.fill('=A1*2');
            await input.press(key);
            await expect(cell(0, 'total')).toHaveText('12');
            expect(await withApi((api) => api.getFocusedCell()?.column.getColId())).toBe(
                key === 'Shift+Tab' ? 'b' : 'other'
            );
        });
    }

    test('clicking a cell inserts a reference at the remembered caret', async ({ page }) => {
        const { input, cell } = await mountFormulaEditor(page);
        await input.fill('=1++2');
        await input.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(3, 3));
        await cell(1, 'a').click();
        await expect(input).toHaveValue('=1+A2+2');
        await expect(input).toBeFocused();
        expect(await input.evaluate((element: HTMLTextAreaElement) => element.selectionStart)).toBe(5);
        await input.press('Enter');
        await expect(cell(0, 'total')).toHaveText('13');
    });

    test('dragging a grid range updates one reference and retains its colour', async ({ page }) => {
        const { input, mirror, cell } = await mountFormulaEditor(page);
        await input.fill('=SUM(');
        const start = (await cell(0, 'a').boundingBox())!;
        const end = (await cell(2, 'b').boundingBox())!;
        await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
        await page.mouse.down();
        await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 6 });
        await page.mouse.up();
        await expect(input).toHaveValue('=SUM(A1:B3');
        await expect(mirror.locator('.ag-formula-token')).toHaveText(['A1:B3']);
        await expect(mirror.locator('.ag-formula-token')).toHaveClass(/ag-formula-token-color-1/);
        await expect(input).toBeFocused();
        await page.keyboard.insertText(')');
        await input.press('Enter');
        await expect(cell(0, 'total')).toHaveText('45');
    });

    test('range replacement uses the reference occurrence, not the rendered spans', async ({ page }) => {
        const { input, cell } = await mountFormulaEditor(page);
        await input.fill('=A1+A1');
        await input.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(5, 5));
        await cell(1, 'b').click();
        await expect(input).toHaveValue('=A1+B2');
        await input.press('Enter');
        await expect(cell(0, 'total')).toHaveText('8');
    });

    test('horizontal scrolling keeps the mirror at the native input scroll position', async ({ page }) => {
        const { input, mirror } = await mountFormulaEditor(page);
        const expression = `=${Array.from({ length: 40 }, () => 'A1*B1').join('+')}`;
        await input.fill(expression);
        await input.press('End');
        await page.keyboard.insertText('+2');
        await expect.poll(() => input.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
        await expect(async () => {
            const scroll = await input.evaluate((element) => element.scrollLeft);
            expect(await mirror.evaluate((element) => element.scrollLeft)).toBeCloseTo(scroll, 0);
        }).toPass();
        await expect(input).toHaveValue(`${expression}+2`);
    });
});
