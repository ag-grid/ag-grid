import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('switches direction and locale when the language changes', async ({ agIdFor, page }) => {
        const select = page.locator('#language');
        const rtl = page.locator('.ag-rtl');
        const ltr = page.locator('.ag-ltr');
        const headerText = (text: string) => page.locator('.ag-header-cell-text', { hasText: text });

        // Open the city column filter and assert its placeholder. The placeholder comes from the
        // built-in `filterOoo` locale key, so it exercises localeText/LocaleModule rather than the
        // manually translated headerName values.
        const assertFilterPlaceholder = async (placeholder: string) => {
            await agIdFor.headerFilterButton('city').click();
            await expect(page.getByPlaceholder(placeholder).first()).toBeVisible();
            await page.keyboard.press('Escape');
        };

        await ensureGridReady(page);
        await waitForGridContent(page);

        // Initial language is Arabic: the grid renders RTL with localised Arabic headers and filter UI.
        await expect(rtl).toHaveCount(1);
        await expect(ltr).toHaveCount(0);
        await expect(headerText('المدينة')).toBeVisible();
        await assertFilterPlaceholder('تصفية...');

        // Switching to English recreates the grid in LTR — impossible without the remount,
        // since enableRtl is an initial-only option.
        await select.selectOption('english');
        await waitForGridContent(page);
        await expect(ltr).toHaveCount(1);
        await expect(rtl).toHaveCount(0);
        await expect(headerText('City')).toBeVisible();
        await assertFilterPlaceholder('Filter...');

        // Switching to Hebrew returns to RTL with localised Hebrew headers and filter UI.
        await select.selectOption('hebrew');
        await waitForGridContent(page);
        await expect(rtl).toHaveCount(1);
        await expect(ltr).toHaveCount(0);
        await expect(headerText('עיר')).toBeVisible();
        await assertFilterPlaceholder('סינון...');
    });
});
