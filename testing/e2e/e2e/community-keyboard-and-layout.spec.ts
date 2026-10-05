import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test.describe('community grid in a real browser', () => {
    test('typing into the text editor and pressing Tab commits the value and moves focus right', async ({ page }) => {
        const { cell, withApi } = await mountGrid(page, {
            options: () => ({
                defaultColDef: { editable: true },
                columnDefs: [{ field: 'make' }, { field: 'model' }],
                rowData: [{ make: 'Toyota', model: 'Celica' }],
            }),
        });

        await cell(0, 'make').click();
        await page.keyboard.press('Enter');
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type('Ford');
        await page.keyboard.press('Tab');

        await expect(cell(0, 'make')).toHaveText('Ford');
        await expect(cell(0, 'model')).toHaveClass(/ag-cell-focus/);
        expect(await withApi((api) => api.getDisplayedRowAtIndex(0)!.data.make)).toBe('Ford');
    });

    test('Escape discards what was typed in the text editor', async ({ page }) => {
        const { cell, grid, withApi } = await mountGrid(page, {
            options: () => ({
                defaultColDef: { editable: true },
                columnDefs: [{ field: 'make' }],
                rowData: [{ make: 'Toyota' }],
            }),
        });

        await cell(0, 'make').dblclick();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type('Ford');
        await page.keyboard.press('Escape');

        await expect(grid.locator('.ag-cell-inline-editing')).toHaveCount(0);
        await expect(cell(0, 'make')).toHaveText('Toyota');
        expect(await withApi((api) => api.getDisplayedRowAtIndex(0)!.data.make)).toBe('Toyota');
    });

    test('columns outside the laid-out viewport render only after a real wheel scroll', async ({ page }) => {
        const { grid, headerCell } = await mountGrid(page, {
            width: 500,
            height: 300,
            options: () => ({
                columnDefs: Array.from({ length: 20 }, (_, i) => ({ field: `col${i}`, width: 100 })),
                rowData: [{}],
            }),
        });

        await expect(headerCell('col0')).toBeVisible();
        await expect(headerCell('col19')).toHaveCount(0);

        await grid.hover();
        // Firefox applies a wheel delta per scroll animation frame, so one large delta can stop short of the end.
        await expect(async () => {
            await page.mouse.wheel(1000, 0);
            await expect(headerCell('col19')).toBeVisible({ timeout: 500 });
        }).toPass();
        await expect(headerCell('col0')).toHaveCount(0);
    });
});
