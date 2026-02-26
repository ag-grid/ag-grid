import { expect, test } from '@playwright/test';

test('header components exposed render', async ({ page }) => {
    test.setTimeout(5_000);

    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    await page.goto('/ag-11760-support');

    await expect(page.getByRole('row')).toHaveCount(4);
    await expect(page.getByRole('gridcell')).toHaveCount(12);

    const make = page.locator('.ag-header-cell-comp-wrapper').first();
    expect(await make.textContent()).toBe('Make ');

    await expect(page.locator('button.ml-auto > svg.ak-icon--menu')).toBeVisible();
    await expect(page.locator('button.ml-auto > svg.ak-icon--filter')).toBeVisible();

    expect(errorLogs.length).toEqual(0);
});
