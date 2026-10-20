import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test.describe('calculated expression editor in a real browser', () => {
    test.beforeEach(async ({ page }) => {
        const { headerCell } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                calculatedColumns: { applyMode: 'deferred' },
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'cost' },
                    { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
                ],
                rowData: [{ revenue: 10, cost: 3 }],
            }),
        });
        const header = headerCell('profit');
        await header.hover();
        await header.locator('.ag-header-cell-menu-button').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Edit Calculated Column' }).click();
    });

    test('typing and undo keep native selection while autocomplete updates the highlights', async ({ page }) => {
        const input = page.locator('.ag-calculated-column-form textarea');
        const mirror = page.locator('.ag-calculated-column-expression-text');
        await input.fill('[Rev');
        await expect(input).toHaveAttribute('aria-controls', /.+/);
        await input.press('Enter');
        await expect(input).toHaveValue('[Revenue]');
        await expect(mirror).toHaveText('[Revenue]');
        expect(await input.evaluate((element: HTMLTextAreaElement) => element.selectionStart)).toBe(9);

        await input.press('End');
        await page.keyboard.insertText(' + 2');
        await expect(mirror).toHaveText('[Revenue] + 2');
        await input.press('ControlOrMeta+Z');
        await expect(input).toHaveValue('[Revenue]');
        await expect(mirror).toHaveText('[Revenue]');

        await input.fill('[Revenue] - [Cots]');
        await input.evaluate((element: HTMLTextAreaElement) => element.setSelectionRange(12, 18));
        await page.keyboard.type('[Cost]');
        await expect(input).toHaveValue('[Revenue] - [Cost]');
        await expect(mirror.locator('.ag-calculated-column-expression-error')).toHaveCount(0);
        await expect(input).toBeFocused();
    });

    test('the highlighted text follows textarea scrolling and wrapping after resize', async ({ page }) => {
        const input = page.locator('.ag-calculated-column-form textarea');
        const mirror = page.locator('.ag-calculated-column-expression-mirror');
        const text = page.locator('.ag-calculated-column-expression-text');
        const expression = `${Array.from({ length: 25 }, () => '[Revenue] +').join('\n')}\n[Cots]`;
        await input.fill(expression);
        await input.evaluate((element: HTMLTextAreaElement) => {
            element.scrollTop = element.scrollHeight;
        });
        await expect.poll(() => input.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
        await expect(async () => {
            const scroll = await input.evaluate((element) => element.scrollTop);
            expect(await mirror.evaluate((element) => element.scrollTop)).toBeCloseTo(scroll, 0);
        }).toPass();
        const inputBounds = (await input.boundingBox())!;
        const errorBounds = (await text.locator('.ag-calculated-column-expression-error').boundingBox())!;
        expect(errorBounds.y).toBeGreaterThanOrEqual(inputBounds.y);
        expect(errorBounds.y + errorBounds.height).toBeLessThanOrEqual(inputBounds.y + inputBounds.height);

        await input.fill(
            '[A long unknown column reference that wraps onto several lines inside this expression field]'
        );
        await page.locator('.ag-calculated-column-panel').evaluate((element: HTMLElement) => {
            element.style.width = '320px';
        });
        await expect
            .poll(() =>
                text
                    .locator('.ag-calculated-column-expression-error')
                    .evaluate((element) => element.getClientRects().length)
            )
            .toBeGreaterThan(1);
        await expect(async () => {
            const clientWidth = await input.evaluate((element) => element.clientWidth);
            expect(await mirror.evaluate((element) => element.clientWidth)).toBe(clientWidth);
        }).toPass();
    });
});

for (const shadowDom of [false, true]) {
    test(`the expression field points at the highlighted suggestion with the grid ${shadowDom ? 'inside' : 'outside'} a shadow root`, async ({
        page,
    }) => {
        const { headerCell } = await mountGrid(page, {
            enterprise: true,
            shadowDom,
            options: () => ({
                calculatedColumns: { applyMode: 'deferred' },
                columnDefs: [
                    { field: 'revenue' },
                    { field: 'cost' },
                    { colId: 'profit', calculatedExpression: '[revenue] - [cost]' },
                ],
                rowData: [{ revenue: 10, cost: 3 }],
            }),
        });
        const header = headerCell('profit');
        await header.hover();
        await header.locator('.ag-header-cell-menu-button').click();
        await page.locator('.ag-menu-option-text', { hasText: 'Edit Calculated Column' }).click();

        const input = page.locator('.ag-calculated-column-form textarea');
        await input.fill('[Rev');
        await input.press('ArrowDown');
        const activeId = await input.getAttribute('aria-activedescendant');
        expect(activeId).toBeTruthy();
        await expect(page.locator(`[id="${activeId}"]`)).toHaveAttribute('role', 'option');
    });
}
