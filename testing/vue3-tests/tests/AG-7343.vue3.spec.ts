import { expect, test } from '@playwright/test';

test('urlql master detail', async ({ page }) => {
    const errorLogs = [];
    // page.on("console", (message) => {
    //   if (message.type() === "error") {
    //     errorLogs.push(message.text())
    //   }
    // })

    // await page.goto('http://localhost:8085/ag-7343');
    //
    // const element = page.locator('[class="ag-icon ag-icon-tree-closed"]').first();
    // await element.click();
    //
    // const matchingErrors = errorLogs.some(errorLog => errorLog.includes('No urql Client was provided'))
    // expect(matchingErrors).toBeFalsy();
});
