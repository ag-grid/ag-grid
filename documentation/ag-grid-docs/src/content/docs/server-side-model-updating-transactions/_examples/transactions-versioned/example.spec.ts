import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('versioned transactions update rows and skip stale updates', async ({ page }) => {
        await waitForGridContent(page);

        // The portfolio groups open by default and load their trades.
        await expect(page.locator('.ag-row[row-id="0"]')).toBeVisible();

        const count = async (selector: string) => Number(await page.locator(selector).textContent());

        // The feed updates trades, and updates that arrive after a newer version of their trade are skipped.
        await expect.poll(() => count('#appliedCount'), { timeout: 15000 }).toBeGreaterThan(0);
        await expect.poll(() => count('#staleCount'), { timeout: 15000 }).toBeGreaterThan(0);

        await page.getByRole('button', { name: 'Stop Feed' }).click();
    });
});
