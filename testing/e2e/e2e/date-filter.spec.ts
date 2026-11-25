import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test('date range validation allows slow year entry', async ({ page }) => {
    const { withApi } = await mountGrid(page, {
        options: () => ({
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { defaultOption: 'inRange' } }],
            rowData: [{ date: new Date(2026, 5, 10) }, { date: new Date(2026, 10, 12) }],
        }),
    });
    await withApi((api) => api.showColumnFilter('date'));
    const from = page.locator('.ag-filter-date-from input').first();
    const to = page.locator('.ag-filter-date-to input').first();
    await from.fill('2026-06-10');
    await to.fill('2000-11-11');
    await expect(to).toHaveAttribute('aria-invalid', 'true');
    const tooltip = page.locator('.ag-filter-validation-tooltip:not(.ag-tooltip-hiding)');
    await expect(tooltip).toContainText('Date must be after');
    await expect(to).toBeFocused();
    await to.click({ position: { x: 15, y: 12 } });
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    // Gaps long enough for any debounced validity report to land mid-entry, yet within WebKit's native
    // one-second digit-entry window.
    await page.keyboard.type('2026', { delay: 600 });

    await expect(to).toHaveValue('2026-11-11');
    await expect(to).toBeFocused();
    await expect(to).toHaveAttribute('aria-invalid', 'false');
    await expect(tooltip).toHaveCount(0);
    await expect
        .poll(() => withApi((api) => api.getFilterModel()))
        .toEqual({
            date: { filterType: 'date', type: 'inRange', dateFrom: '2026-06-10', dateTo: '2026-11-11' },
        });
});

test('date validation tooltips follow focus and hover and close with the filter', async ({ page }) => {
    const { withApi } = await mountGrid(page, {
        options: () => ({
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { defaultOption: 'inRange' } }],
            rowData: [{ date: new Date(2026, 5, 10) }],
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
            tooltipInteraction: true,
        }),
    });
    await withApi((api) => api.showColumnFilter('date'));
    const from = page.locator('.ag-filter-date-from input').first();
    const to = page.locator('.ag-filter-date-to input').first();
    const tooltip = page.locator('.ag-filter-validation-tooltip:not(.ag-tooltip-hiding)');
    await from.fill('2026-06-10');
    await to.fill('2000-11-11');
    await page.mouse.move(790, 490);
    await expect(tooltip).toContainText('Date must be after');
    await expect(tooltip).toHaveAttribute('role', 'tooltip');
    await expect(to).toBeFocused();

    await from.focus();
    await expect(tooltip).toContainText('Date must be before');
    await expect(from).toBeFocused();
    await page.locator('.ag-filter-body-wrapper [role="combobox"]').first().focus();
    await expect(tooltip).toHaveCount(0);
    await from.hover();
    await expect(tooltip).toContainText('Date must be before');
    await expect(from).not.toBeFocused();

    await withApi((api) => api.hideColumnFilter());
    await expect(tooltip).toHaveCount(0);
});
