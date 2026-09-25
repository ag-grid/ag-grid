import type { Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const rows = (page: Page) => page.locator('.ag-grid-scrolling-container .ag-row[row-id]');

test.agExample(import.meta, () => {
    test.eachFramework('a value typed after it has left the data still filters when it returns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Apply Data Update 1' }).click();
        const input = page.locator('.ag-advanced-filter input[type=text]');
        await input.fill('[Set Filter Column] is any of [');
        const suggestion = (value: string) =>
            page.locator('.ag-autocomplete-row-label', { hasText: new RegExp(`^${value}$`) });
        await expect(suggestion('A')).toBeVisible();
        await expect(suggestion('B')).toHaveCount(0);

        await input.fill('[Set Filter Column] is any of ["B"]');
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();
        await expect(rows(page)).toHaveCount(0);

        await page.getByRole('button', { name: 'Apply Data Update 2' }).click();
        await expect(rows(page)).toHaveCount(1);
    });
});
