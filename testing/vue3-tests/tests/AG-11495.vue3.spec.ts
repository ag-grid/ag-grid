import { expect, test } from '@playwright/test';

test('ensure no v-model/rowdata error message', async ({ page }) => {
    test.setTimeout(5_000);

    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    await page.goto('/ag-11495');

    await expect(page.getByRole('row')).toHaveCount(4);
    await expect(page.getByRole('gridcell')).toHaveCount(12);

    expect(errorLogs.length).toEqual(0);
});
