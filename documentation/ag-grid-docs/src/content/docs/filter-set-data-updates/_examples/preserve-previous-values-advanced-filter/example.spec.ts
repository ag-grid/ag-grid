import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const rows = (page: any) => page.locator('.ag-grid-scrolling-container .ag-row[row-id]');

    test.eachFramework('a country typed after it has left the data still filters when it returns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Show 2012' }).click();
        const input = page.locator('.ag-advanced-filter input[type=text]');
        await input.fill('[Country] is any of [Au');
        const suggestion = (value: string) =>
            page.locator('.ag-autocomplete-row-label', { hasText: new RegExp(`^${value}$`) });
        await expect(suggestion('Australia')).toBeVisible();
        await expect(suggestion('Austria')).toHaveCount(0);

        await input.fill('[Country] is any of ["Austria"]');
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();
        await expect(rows(page)).toHaveCount(0);

        await page.getByRole('button', { name: 'Show 2008' }).click();
        await expect(rows(page)).toHaveCount(3);
    });
});
