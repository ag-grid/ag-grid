import { expect, test } from '@playwright/test';

test('header components exposed render', async ({ page }) => {
    test.setTimeout(5_000);

    // await page.goto('http://localhost:8085/simple-md/dist/');

    // await expect(page.getByRole('row')).toHaveCount(2);
    // await expect(page.getByRole('gridcell')).toHaveCount(4);
    //
    // await expect(page.locator('.full-width-details')).toBeHidden();
    // await expect(page.locator('.full-width-grid')).toBeHidden();
    //
    // await page.locator('span.ag-icon-tree-closed').click()
    // await expect(page.locator('.full-width-details')).toBeVisible();
    // await expect(page.locator('.full-width-grid')).toBeVisible();
    //
    // const name = page.locator('div.full-width-detail').first();
    // const account = page.locator('div.full-width-detail').last();
    // await expect(await name.textContent()).toBe('Name: Nora Thomas');
    // await expect(await account.textContent()).toBe('Account: 177000');
    //
    // await expect(page.locator('.full-width-grid').getByRole('row')).toHaveCount(2);
    // await expect(page.locator('.full-width-grid').getByRole('gridcell')).toHaveCount(5);
});
