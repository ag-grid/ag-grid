import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The default text-filter type label ("Contains") as translated by AG_GRID_LOCALE_EG /
// AG_GRID_LOCALE_IL. Asserting this proves the LocaleModule + localeText wiring is live —
// unlike the column headers, this string is produced by the grid, not the columnDefs.
const CONTAINS: Record<string, string> = {
    arabic: 'يحتوي على',
    english: 'Contains',
    hebrew: 'מכיל',
};

test.agExample(import.meta, () => {
    test.eachFramework('switches direction and locale when the language changes', async ({ page, agIdFor }) => {
        const select = page.locator('#language');
        const rtl = page.locator('.ag-rtl');
        const ltr = page.locator('.ag-ltr');
        const headerText = (text: string) => page.locator('.ag-header-cell-text', { hasText: text });

        // Open the name column's filter and confirm the grid-translated "Contains" label,
        // then close the popup so the next language switch starts clean.
        const expectFilterLocale = async (language: string) => {
            await agIdFor.headerFilterButton('name').click();
            await expect(page.getByText(CONTAINS[language], { exact: true })).toBeVisible();
            await page.keyboard.press('Escape');
        };

        await ensureGridReady(page);
        await waitForGridContent(page);

        // Initial language is Arabic: the grid renders RTL with localised Arabic headers.
        await expect(rtl).toHaveCount(1);
        await expect(ltr).toHaveCount(0);
        await expect(headerText('الاسم')).toBeVisible();
        await expectFilterLocale('arabic');

        // Switching to English recreates the grid in LTR — impossible without the remount,
        // since enableRtl is an initial-only option.
        await select.selectOption('english');
        await waitForGridContent(page);
        await expect(ltr).toHaveCount(1);
        await expect(rtl).toHaveCount(0);
        await expect(headerText('Name')).toBeVisible();
        await expectFilterLocale('english');

        // Switching to Hebrew returns to RTL with localised Hebrew headers.
        await select.selectOption('hebrew');
        await waitForGridContent(page);
        await expect(rtl).toHaveCount(1);
        await expect(ltr).toHaveCount(0);
        await expect(headerText('שם')).toBeVisible();
        await expectFilterLocale('hebrew');
    });
});
