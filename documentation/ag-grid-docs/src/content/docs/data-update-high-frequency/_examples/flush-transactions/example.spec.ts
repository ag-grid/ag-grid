import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Groups by product and expands to reveal portfolio sub-groups', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Products are a fixed list in data.ts, so the top-level group rows are deterministic.
        await expect(agIdFor.autoGroupCell('row-group-product-Palm Oil')).toContainText('Palm Oil', {
            useInnerText: true,
        });

        // Portfolio sub-groups only appear once the product group is expanded.
        const findGroupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        await expect(findGroupRow('Aggressive')).toHaveCount(0);
        await agIdFor.autoGroupContracted('row-group-product-Palm Oil').click();
        await expect(findGroupRow('Aggressive')).toBeVisible();
    });

    test.eachFramework('Flush Transactions button flushes the async queue', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // A background feed streams applyTransactionAsync updates every 500ms with a 4s batch wait.
        // Clicking Flush applies all pending transactions immediately without throwing.
        await page.getByRole('button', { name: 'Flush Transactions' }).click();

        // Grid remains intact and grouped after flushing.
        await expect(agIdFor.autoGroupCell('row-group-product-Palm Oil')).toContainText('Palm Oil', {
            useInnerText: true,
        });
    });
});
