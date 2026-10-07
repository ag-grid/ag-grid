import { expect, test } from '@playwright/test';

test.describe('AG-18831 exposed renderer methods', () => {
    test('getCellRendererInstances returns instances with methods exposed via expose() and defineExpose', async ({
        page,
    }) => {
        await page.goto('/ag-18831');

        await expect(page.getByRole('gridcell')).toHaveCount(3);
        await page.locator('#check-instances').click();

        await expect(page.locator('#result-options')).toHaveText('found:options:1');
        await expect(page.locator('#result-setup-expose')).toHaveText('found:setup-expose:2');
        await expect(page.locator('#result-script-setup')).toHaveText('found:script-setup:3');
    });
});
