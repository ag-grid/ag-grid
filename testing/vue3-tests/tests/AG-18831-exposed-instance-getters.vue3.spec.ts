import { expect, test } from '@playwright/test';

test.describe('AG-18831 exposed members on other instance getters', () => {
    test('instance getters return instances with members exposed via defineExpose', async ({ page }) => {
        await page.goto('/ag-18831-getters');

        await expect(page.getByRole('gridcell').first()).toBeVisible();
        await page.locator('#check-instances').click();

        await expect(page.locator('#result-full-width')).toHaveText('found:exposed:full-width');
        await expect(page.locator('#result-cell-editor')).toHaveText('found:exposed:cell');
        await expect(page.locator('#result-filter')).toHaveText(/^found:exposed:/);
        await expect(page.locator('#result-status-panel')).toHaveText('found:exposed:status-panel');
        await expect(page.locator('#result-tool-panel')).toHaveText('found:exposed:tool-panel');
        await expect(page.locator('#result-identity')).toHaveText('true');
    });
});
