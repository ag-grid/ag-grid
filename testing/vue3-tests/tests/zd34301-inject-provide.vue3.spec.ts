import { expect, test } from '@playwright/test';

test('aligned grids', async ({ page }) => {
    test.setTimeout(5_000);

    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    await page.goto('/zd34301');

    const firstCell = page.locator('.ag-cell-value').first();
    await firstCell.waitFor();

    expect(await page.locator('#grid-cell-renderer').count()).toBe(2);
    expect(await page.locator('#table-timestamp').count()).toBe(2);

    let cellTimestamps = await page.locator('#grid-cell-renderer').allInnerTexts();
    let tableTimestamps = await page.locator('#table-timestamp').allInnerTexts();

    const originalTimestamps = cellTimestamps.concat(tableTimestamps);
    expect(originalTimestamps.every((v) => v === originalTimestamps[0])).toBeTruthy();

    await page.locator('#unmount').click();
    await page.waitForTimeout(500);

    await page.locator('#mount').click();
    await page.waitForTimeout(500);

    cellTimestamps = await page.locator('#grid-cell-renderer').allInnerTexts();
    tableTimestamps = await page.locator('#table-timestamp').allInnerTexts();

    const newTimestamps = cellTimestamps.concat(tableTimestamps);
    expect(newTimestamps.every((v) => v === newTimestamps[0])).toBeTruthy();
});
