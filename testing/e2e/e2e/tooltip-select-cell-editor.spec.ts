import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

const LONG_VALUE = 'A very long value that cannot possibly fit in the editor';

const mountEditorGrid = (page: Page, cellEditor: string, withValidationError = false) =>
    mountGrid(page, {
        enterprise: true,
        options: new Function(`return () => ({
            columnDefs: [{
                field: 'value',
                width: 160,
                editable: true,
                cellEditor: '${cellEditor}',
                cellEditorParams: {
                    values: ['Short', '${LONG_VALUE}'],
                    ${withValidationError ? "getValidationErrors: () => ['Invalid choice']," : ''}
                },
            }],
            rowData: [{ value: 'Short' }, { value: '${LONG_VALUE}' }],
            tooltipShowDelay: 0,
        })`)(),
    });

const hoverEditorValue = async (page: Page) => {
    const display = page.locator('.ag-cell-inline-editing .ag-picker-field-display');
    await expect(display).toHaveCount(1);
    await page.mouse.move(0, 0);
    await display.hover();
    // With no show delay the tooltip is shown on the next tick, so this is ample for the cases asserting none.
    await page.waitForTimeout(300);
    return page.locator('.ag-tooltip');
};

for (const cellEditor of ['agSelectCellEditor', 'agRichSelectCellEditor']) {
    test.describe(`${cellEditor} value tooltip`, () => {
        test('shows a tooltip for a value truncated with an ellipsis', async ({ page }) => {
            const { cell } = await mountEditorGrid(page, cellEditor);
            await cell(1, 'value').dblclick();
            await expect(await hoverEditorValue(page)).toHaveText(LONG_VALUE);
        });

        test('shows no tooltip for a value that fits', async ({ page }) => {
            const { cell } = await mountEditorGrid(page, cellEditor);
            await cell(0, 'value').dblclick();
            await expect(await hoverEditorValue(page)).toHaveCount(0);
        });

        test('still shows the validation error when editing starts', async ({ page }) => {
            const { cell } = await mountEditorGrid(page, cellEditor, true);
            await cell(1, 'value').dblclick();
            await expect(page.locator('.ag-tooltip').filter({ hasText: 'Invalid choice' })).toHaveCount(1);
        });
    });
}
