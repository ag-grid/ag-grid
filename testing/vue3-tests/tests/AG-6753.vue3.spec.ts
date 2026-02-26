import { expect, test } from '@playwright/test';

test('AG-6753 rowData is reactive', async ({ page }) => {
    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    await page.goto('/ag-6753');

    // should start off with one row
    await expect(page.getByRole('gridcell')).toHaveCount(1);

    // when the first cell is clicked another row should be added
    await page.getByRole('gridcell').first().click();
    await expect(page.getByRole('gridcell')).toHaveCount(2);

    // when the first cell is clicked a third row should be added
    await page.getByRole('gridcell').first().click();
    await expect(page.getByRole('gridcell')).toHaveCount(3);

    expect(errorLogs.length).toEqual(0);
});
