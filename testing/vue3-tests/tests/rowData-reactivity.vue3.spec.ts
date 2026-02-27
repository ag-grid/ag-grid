import { expect, test } from '@playwright/test';

test('rowData reactivity', async ({ page }) => {
    test.setTimeout(5_000);

    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    await page.goto('/simple-vue3-grid');

    const firstCell = page.locator('.ag-cell-value').first();
    await firstCell.waitFor();

    // should start off with one row
    expect(await page.getByRole('gridcell')).toHaveCount(3);
    expect(await page.getByRole('gridcell').first().textContent()).toBe('Tesla');
    expect(await page.getByRole('gridcell').locator('.priceIcon').count()).toBe(6);

    await page.getByRole('button').click();

    await page.waitForTimeout(2000); // waits for 2 seconds

    expect(await page.getByRole('gridcell')).toHaveCount(6);
    expect(await page.getByRole('gridcell').nth(3).textContent()).toBe('Wibble');
    expect(await page.getByRole('gridcell').locator('.priceIcon').count()).toBe(8);

    expect(errorLogs.length).toEqual(0);
});
