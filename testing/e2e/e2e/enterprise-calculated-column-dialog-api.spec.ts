import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test.describe('calculated column dialog API focus restoration', () => {
    test('Escape scrolls a virtualised calculated column into view and focuses its header', async ({ page }) => {
        const { headerCell, withApi } = await mountGrid(page, {
            enterprise: true,
            width: 500,
            options: () => ({
                calculatedColumns: true,
                columnDefs: [
                    ...Array.from({ length: 12 }, (_, index) => ({ field: `column${index}` })),
                    { colId: 'profit', calculatedExpression: '1' },
                ],
                defaultColDef: { width: 150 },
                rowData: [{}],
            }),
        });
        await expect(headerCell('profit')).toHaveCount(0);
        await withApi((api) => api.openCalculatedColumnDialog('profit'));
        await expect(page.getByRole('textbox', { name: 'Title', exact: true })).toBeFocused();
        await expect(headerCell('profit')).toHaveCount(0);
        await page.keyboard.press('Escape');
        await expect(page.locator('.ag-calculated-column-form')).toHaveCount(0);
        await expect(headerCell('profit')).toBeFocused();
        await expect(headerCell('profit')).toBeInViewport();
    });

    test('Escape from an unapplied deferred Add restores its virtualised source header', async ({ page }) => {
        const { headerCell, withApi } = await mountGrid(page, {
            enterprise: true,
            width: 500,
            options: () => ({
                calculatedColumns: { applyMode: 'deferred' },
                columnDefs: Array.from({ length: 12 }, (_, index) => ({ field: `column${index}` })),
                defaultColDef: { width: 150 },
                rowData: [{}],
            }),
        });
        await expect(headerCell('column11')).toHaveCount(0);
        await withApi((api) => api.openAddCalculatedColumnDialog('column11'));
        await expect(page.getByRole('textbox', { name: 'Title', exact: true })).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(page.locator('.ag-calculated-column-form')).toHaveCount(0);
        expect(await withApi((api) => api.getColumn('calculated_1') === null)).toBe(true);
        await expect(headerCell('column11')).toBeFocused();
        await expect(headerCell('column11')).toBeInViewport();
    });
});
