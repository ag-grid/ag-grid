import { expect, test } from '@playwright/test';

test('rowData reactivity', async ({ page }) => {
    test.setTimeout(5_000);

    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    await page.goto('/zd40289');

    const firstCell = page.locator('.ag-cell-value').first();
    await firstCell.waitFor({ state: 'visible', timeout: 30000 });

    // should start off with one row
    expect(await page.getByRole('gridcell')).toHaveCount(24);
    expect(await page.getByRole('gridcell').first().textContent()).toBe('Tesla');
    expect(await page.getByRole('gridcell').nth(1).textContent()).toBe('Model Y');

    await page.waitForTimeout(500);

    expect(await page.getByRole('watch')).toHaveCount(0);

    expect(errorLogs.length).toEqual(0);
});
