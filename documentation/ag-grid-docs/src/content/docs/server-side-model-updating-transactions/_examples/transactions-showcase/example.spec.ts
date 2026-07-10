import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'async transactions keep grouping and aggregations in sync under a live stream',
        async ({ page }) => {
            await waitForGridContent(page);

            const groupRow = (name: string) =>
                page
                    .locator('.ag-row')
                    .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                    .first();

            // Data is grouped by product > portfolio > book with summed aggregations.
            const woolGroup = groupRow('Wool');
            await expect(woolGroup).toBeVisible();
            // Group rows display a server-provided child count, e.g. "Wool (48)".
            await expect(woolGroup.locator('.ag-group-child-count')).toContainText(/\(\d+\)/);
            // Group rows carry an aggregated 'current' total.
            await expect(woolGroup.locator('[col-id="current"]')).toContainText(/\d/);
            // Wool is open by default, so its child portfolio groups are visible.
            await expect(groupRow('Aggressive')).toBeVisible();

            // Capture the rendered grid text, then start the transaction stream.
            const snapshot = () =>
                page.evaluate(() =>
                    Array.from(document.querySelectorAll('.ag-row'))
                        .map((r) => (r as HTMLElement).innerText)
                        .join('|')
                );
            const gridBefore = await snapshot();
            await page.getByRole('button', { name: 'Start Updates' }).click();

            // Poll (with a bounded timeout) until a streamed transaction has been processed and
            // rendered — i.e. the grid text differs from the captured baseline — rather than
            // assuming a fixed sleep is long enough for the timers to fire under a busy worker.
            await page.waitForFunction(
                (before) => {
                    const now = Array.from(document.querySelectorAll('.ag-row'))
                        .map((r) => (r as HTMLElement).innerText)
                        .join('|');
                    return now.length > 0 && now !== before;
                },
                gridBefore,
                { timeout: 15000 }
            );

            await page.getByRole('button', { name: 'Stop Updates' }).click();
        }
    );
});
