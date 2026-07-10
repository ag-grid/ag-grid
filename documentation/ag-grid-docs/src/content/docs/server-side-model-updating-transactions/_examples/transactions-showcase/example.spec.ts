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
            const gridText = () => page.locator('.ag-row').allInnerTexts();
            const gridBefore = (await gridText()).join('|');
            await page.getByRole('button', { name: 'Start Updates' }).click();

            // The stream applies async update/add/remove transactions once per second;
            // wait a few ticks and confirm the rendered values changed.
            await page.waitForTimeout(3000);
            const gridAfter = (await gridText()).join('|');
            expect(gridAfter).not.toBe(gridBefore);

            await page.getByRole('button', { name: 'Stop Updates' }).click();
        }
    );
});
