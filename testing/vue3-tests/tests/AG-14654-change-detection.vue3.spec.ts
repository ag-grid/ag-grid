import { expect, test } from '@playwright/test';

test('row data property mutation updates grid cell', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/ag-14654');

    // Wait for grid to render
    await expect(page.getByRole('gridcell')).toHaveCount(6);

    // Capture the initial price value of the first row
    const priceCell = page.getByRole('gridcell').nth(1);
    const initialPrice = await priceCell.textContent();

    // Wait for the interval to fire and update the price
    await page.waitForTimeout(500);

    // The price should have changed from the initial value
    const updatedPrice = await priceCell.textContent();
    expect(updatedPrice).not.toBe(initialPrice);
});
