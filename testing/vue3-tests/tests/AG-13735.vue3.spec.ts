import { expect, test } from '@playwright/test';

test('rowData is reactive', async ({ page }) => {
    test.setTimeout(10_000);

    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    await page.goto('/ag-13735');

    const firstCell = page.locator('.ag-cell-value').first();
    await firstCell.waitFor({ state: 'visible', timeout: 30000 });

    await expect(page.getByRole('gridcell')).toHaveCount(3);

    expect(await page.getByRole('gridcell').nth(0).textContent()).toBe('Mission: name 1');
    expect(await page.getByRole('gridcell').nth(1).textContent()).toBe('Mission: name 2');
    expect(await page.getByRole('gridcell').nth(2).textContent()).toBe('Mission: name 3');

    expect(errorLogs.length).toEqual(0);
});
