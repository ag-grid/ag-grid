import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // 100,000 rows sorted across three columns. Each button applies a transaction
    // (one add + one update) and reports how long the transaction took.
    test.eachFramework('Both transaction buttons apply and report a duration', async ({ agIdFor, page }) => {
        // Wait for the (large) grid to render before interacting with the controls.
        await expect(agIdFor.headerCell('sort')).toBeVisible();

        const duration = page.locator('#transactionDuration');
        await expect(duration).toHaveText('N/A');

        // Default transaction (deltaSort off).
        await page.getByRole('button', { name: 'Default Transaction' }).click();
        await expect(duration).toContainText('ms');

        // Delta transaction (deltaSort on).
        await page.getByRole('button', { name: 'Delta Transaction' }).click();
        await expect(duration).toContainText('ms');
    });
});
