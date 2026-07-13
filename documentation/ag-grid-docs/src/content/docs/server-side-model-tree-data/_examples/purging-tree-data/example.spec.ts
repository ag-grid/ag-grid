import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Refresh buttons purge and reload the tree cache', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Default-open path: Kathryn Powers -> Mabel Ward and Mabel Ward's loaded children.
        await expect(groupRow('Kathryn Powers')).toBeVisible();
        await expect(groupRow('Mabel Ward')).toBeVisible();
        await expect(groupRow('Bryan Butler')).toBeVisible();

        // Refreshing the whole tree purges every cache and reloads from the server.
        await page.getByRole('button', { name: 'Refresh Everything' }).click();
        await expect(page.locator('.ag-row-loading').first()).toBeVisible();
        await expect(groupRow('Kathryn Powers')).toBeVisible();
        await expect(groupRow('Mabel Ward')).toBeVisible();
        await expect(groupRow('Bryan Butler')).toBeVisible();

        // Refreshing a single node's cache purges just that route (Kathryn Powers -> Mabel Ward).
        await page.getByRole('button', { name: "Refresh ['Kathryn Powers','Mabel Ward']" }).click();
        await expect(page.locator('.ag-row-loading').first()).toBeVisible();
        await expect(groupRow('Bryan Butler')).toBeVisible();
    });
});
