import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// 1x1 transparent PNG used to stub the external flag CDN, so the flag-image assertions do not depend
// on network reachability of flags.fmcdn.net.
const TRANSPARENT_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);

test.agExample(import.meta, () => {
    test.eachFramework('defaults to Arabic and renders in RTL', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-rtl').first()).toBeVisible();
        await expect(page.locator('.ag-ltr')).toHaveCount(0);
        await expect(page.locator('.ag-row').first()).toBeVisible();
    });

    test.eachFramework('switching to English flips to LTR and renders country flags', async ({ page }) => {
        await page.route('https://flags.fmcdn.net/**', (route) =>
            route.fulfill({ status: 200, contentType: 'image/png', body: TRANSPARENT_PNG })
        );

        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#language').selectOption('english');

        // The grid remounts on language change because enableRtl and localeText are initial-only options.
        await expect(page.locator('.ag-ltr').first()).toBeVisible();
        await expect(page.locator('.ag-rtl')).toHaveCount(0);
        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'Total Winnings' }).first()).toBeVisible();

        // English country names resolve to a flag code, so the CountryCellRenderer renders a flag image.
        await expect(page.locator('.ag-cell[col-id="country"] img.flag').first()).toBeVisible();
    });

    test.eachFramework('switching to Hebrew stays in RTL with the Hebrew locale', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#language').selectOption('hebrew');

        await expect(page.locator('.ag-header-cell-text').filter({ hasText: 'שם' }).first()).toBeVisible();
        await expect(page.locator('.ag-rtl').first()).toBeVisible();
        await expect(page.locator('.ag-ltr')).toHaveCount(0);
    });
});
