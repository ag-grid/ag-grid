import { expect, test } from '@playwright/test';

test('aligned grids', async ({ page }) => {
    test.setTimeout(5_000);

    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    await page.goto('http://localhost:8085/aligned-grids/');

    // await page.waitForTimeout(2000); // waits for 2 seconds
    // // const firstCell = page.locator('.ag-cell-value').first();
    // // await firstCell.waitFor();
    //
    // expect(await page.locator('span.ag-icon-contracted:visible').count()).toBe(2);
    //
    // expect(await page.getByRole('gridcell')).toHaveCount(192);
    // expect(await page.locator('span.ag-header-cell-text:visible').count()).toBe(10);
    //
    // await page.locator('span.ag-icon-contracted:visible').first().click();
    //
    // expect(await page.getByRole('gridcell')).toHaveCount(256);
    // expect(await page.locator('span.ag-header-cell-text:visible').count()).toBe(16);

    expect(errorLogs.length).toEqual(0);
});
