import { expect, test } from '@playwright/test';

test('ts examples compiles', async ({ page }) => {
    test.setTimeout(5_000);

    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    await page.goto('/ts-testcase');

    const firstCell = page.locator('.ag-cell-value').first();
    await firstCell.waitFor();

    expect(await page.getByRole('gridcell')).toHaveCount(160);
    expect(await page.getByRole('gridcell').first().textContent()).toBe('Natalie Coughlin');

    expect(errorLogs.length).toEqual(0);
});
