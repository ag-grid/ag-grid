import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'applyServerSideTransactionAsync advances update counts under a live stream',
        async ({ page }) => {
            await waitForGridContent(page);

            // Sum the 'updateCount' column across the currently rendered rows.
            const updateCountCells = page.locator('.ag-cell[col-id="updateCount"]');
            const sumUpdateCount = () =>
                updateCountCells.evaluateAll((cells) =>
                    cells.reduce((total, cell) => total + (parseInt(cell.textContent?.trim() || '0', 10) || 0), 0)
                );

            // Wait for the server-side data to load, then confirm all seeded rows start with updateCount 0.
            await expect(updateCountCells.first()).toBeVisible();
            expect(await sumUpdateCount()).toBe(0);

            // Start the stream of async update/add/remove transactions.
            await page.getByRole('button', { name: 'Start Updates' }).click();

            // Poll (with a bounded timeout) until batched async transactions have landed and the
            // summed updateCount becomes positive — no reliance on a fixed sleep matching the timers.
            await page.waitForFunction(
                () =>
                    Array.from(document.querySelectorAll('.ag-cell[col-id="updateCount"]')).reduce(
                        (total, cell) => total + (parseInt(cell.textContent?.trim() || '0', 10) || 0),
                        0
                    ) > 0,
                undefined,
                { timeout: 15000 }
            );
            expect(await sumUpdateCount()).toBeGreaterThan(0);

            await page.getByRole('button', { name: 'Stop Updates' }).click();
        }
    );
});
