import { expect, test } from '@playwright/test';

const fw = process.env.FW_TYPE ?? 'Unknown';
const subcase = process.env.FW_PATCH_TYPE ? `-${process.env.FW_PATCH_TYPE}` : '';
const version = process.env.FW_VERSION ?? 'unknown';
const titleCaseFw = fw.charAt(0).toUpperCase() + fw.substring(1);

test.describe(`${titleCaseFw} ${version}`, () => {
    test('loads as expected', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveScreenshot(`${fw}-${version}${subcase}.png`, {
            animations: 'disabled',
            stylePath: 'e2e/basic.css',
        });
    });
});
