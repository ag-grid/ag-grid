import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test('Set Filter floating values show the full selected list only while truncated', async ({ page }) => {
    const { grid, withApi } = await mountGrid(page, {
        enterprise: true,
        options: () => ({
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', floatingFilter: true, width: 150 }],
            rowData: ['Argentina', 'Australia', 'Austria', 'Belgium'].map((country) => ({ country })),
            tooltipShowDelay: 0,
            tooltipSwitchShowDelay: 0,
        }),
    });
    await withApi(async (api) => {
        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Argentina', 'Australia', 'Austria'] });
        api.onFilterChanged();
    });
    const source = grid.locator('.ag-set-floating-filter-input .ag-input-field');
    const input = source.locator('input');
    const tooltip = page.getByRole('tooltip');
    const summary = '(3) Argentina,Australia,Austria';
    await expect(input).toHaveValue(summary);
    expect(await input.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);

    await grid.getByRole('columnheader').focus();
    await page.keyboard.press('ArrowDown');
    const header = grid.locator('.ag-floating-filter');
    await expect(header).toBeFocused();
    await expect(header).toHaveAccessibleDescription(summary);
    await expect(tooltip).toHaveText(summary);
    await page.keyboard.press('Escape');
    await expect(header).toBeFocused();
    await expect(tooltip).toHaveCount(0);
    await page.keyboard.press('ArrowUp');

    await source.hover();
    await expect(tooltip).toHaveText(summary);

    await page.mouse.move(700, 300);
    await expect(tooltip).toHaveCount(0);
    await withApi((api) => api.setColumnWidths([{ key: 'country', newWidth: 600 }]));
    await expect.poll(() => input.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false);
    await page.clock.install();
    await source.hover();
    await page.clock.runFor(1);
    await expect(input).toHaveValue(summary);
    await expect(tooltip).toHaveCount(0);
});
