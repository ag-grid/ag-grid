import { expect, test } from '@playwright/test';

test('row data reactivity', async ({ page }) => {
    test.setTimeout(5_000);

    await page.goto('/zd35354');

    expect(await page.getByRole('gridcell')).toHaveCount(35);
    expect(await page.getByRole('gridcell').nth(1).textContent()).toBe('AO');
    expect(await page.getByRole('gridcell').nth(8).textContent()).toBe('EC37B');

    await page.locator('button').first().click();
    await page.waitForTimeout(50);
    expect(await page.getByRole('gridcell')).toHaveCount(35);
    expect(await page.getByRole('gridcell').nth(1).textContent()).toBe('First Update');
    expect(await page.getByRole('gridcell').nth(8).textContent()).toBe('EC37B');

    await page.locator('button').last().click();
    await page.waitForTimeout(50);
    expect(await page.getByRole('gridcell')).toHaveCount(35);
    expect(await page.getByRole('gridcell').nth(1).textContent()).toBe('First Update');
    expect(await page.getByRole('gridcell').nth(8).textContent()).toBe('Second Update');
});
