import { expect, gridApiHandle, test, waitForGridContent } from '@utils/grid/test-utils';

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

    test.eachFramework(
        'removing every row group streams complete transactions to the flat list',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            // Remove product, portfolio and book from the row group panel, leaving a flat list of trades.
            const pills = agIdFor.columnDropArea('panel', 'Row Groups').locator('.ag-column-drop-cell');
            await expect(pills).toHaveCount(3);
            for (const name of ['Product', 'Portfolio', 'Book']) {
                // The panel re-renders while the grid reloads, which can swallow a click, so retry it.
                const pill = pills.filter({ hasText: name });
                await expect(async () => {
                    if ((await pill.count()) > 0) {
                        await pill.locator('.ag-column-drop-cell-button').click({ timeout: 1000 });
                    }
                    await expect(pill).toHaveCount(0, { timeout: 1000 });
                }).toPass();
            }
            await expect(pills).toHaveCount(0);
            await expect(page.locator('.ag-row-group')).toHaveCount(0);
            await expect(page.locator('.ag-row [col-id="tradeId"]').first()).toContainText(/\d/);

            // The rows the fake server updates and removes are random across ~1,300 trades and mostly
            // off-screen, so record the transactions the root store applies rather than what is rendered.
            const applied = await page.evaluateHandle(() => [] as { add: number; update: number; remove: number }[]);
            const api = await gridApiHandle(page);
            await api.evaluate((api, applied) => {
                api.setGridOption('isApplyServerSideTransaction', ({ transaction, parentNode }) => {
                    if (parentNode.level === -1) {
                        applied.push({
                            add: transaction.add?.length ?? 0,
                            update: transaction.update?.length ?? 0,
                            remove: transaction.remove?.length ?? 0,
                        });
                    }
                    return true;
                });
            }, applied);

            await page.getByRole('button', { name: 'Start Updates' }).click();

            // Each tick updates 5 trades, adds 2 and removes 2, all in one transaction for the flat list.
            await expect(async () => {
                const transactions = await applied.jsonValue();
                expect(transactions.length).toBeGreaterThan(0);
                expect(transactions).toEqual(transactions.map(() => ({ add: 2, update: 5, remove: 2 })));
            }).toPass({ timeout: 15000 });

            await page.getByRole('button', { name: 'Stop Updates' }).click();
        }
    );
});
