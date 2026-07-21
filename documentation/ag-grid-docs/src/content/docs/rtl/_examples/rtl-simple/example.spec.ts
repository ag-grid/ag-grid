import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('switches direction and locale when the language changes', async ({ page }) => {
        const select = page.locator('#language');
        const rtl = page.locator('.ag-rtl');
        const ltr = page.locator('.ag-ltr');
        const headerText = (text: string) => page.locator('.ag-header-cell-text', { hasText: text });

        await ensureGridReady(page);
        await waitForGridContent(page);

        // Initial language is Arabic: the grid renders RTL with localised Arabic headers.
        await expect(rtl).toHaveCount(1);
        await expect(ltr).toHaveCount(0);
        await expect(headerText('الاسم')).toBeVisible();

        // Switching to English recreates the grid in LTR — impossible without the remount,
        // since enableRtl is an initial-only option.
        await select.selectOption('english');
        await waitForGridContent(page);
        await expect(ltr).toHaveCount(1);
        await expect(rtl).toHaveCount(0);
        await expect(headerText('Name')).toBeVisible();

        // Switching to Hebrew returns to RTL with localised Hebrew headers.
        await select.selectOption('hebrew');
        await waitForGridContent(page);
        await expect(rtl).toHaveCount(1);
        await expect(ltr).toHaveCount(0);
        await expect(headerText('שם')).toBeVisible();
    });
});
