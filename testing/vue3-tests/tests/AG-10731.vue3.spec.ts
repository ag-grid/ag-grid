import { expect, test } from '@playwright/test';

test('quasar get value', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/ag-10731');

    await page.getByRole('gridcell').dblclick();

    await expect(page.locator('#goldeditor')).toBeVisible();
    await page.locator('#goldeditor').fill('10');
    await page.locator('#goldeditor').press('Enter');

    expect(await page.getByRole('gridcell').textContent()).toBe('20');
});
