import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('routed transactions add, move and remove rows within groups', async ({ page }) => {
        await waitForGridContent(page);

        // Group rows use getRowId === portfolio (level 0), leaf rows === tradeId.
        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Top level is grouped by portfolio; Aggressive and Hybrid open by default.
        await expect(groupRow('Aggressive')).toBeVisible();
        await expect(groupRow('Hybrid')).toBeVisible();
        // The first Aggressive leaf (tradeId 0) is lazy-loaded and visible under the open group.
        await expect(page.locator('.ag-row[row-id="0"]')).toBeVisible();

        // "Add new 'Aggressive'" applies a routed add to the Aggressive group,
        // creating leaf tradeId 11 (the server pre-increments its counter from the seed count of 10) with book GL-1.
        await page.getByRole('button', { name: "Add new 'Aggressive'" }).click();
        const newLeaf = page.locator('.ag-row[row-id="11"]');
        await expect(newLeaf).toBeVisible();
        await expect(newLeaf.locator('[col-id="book"]')).toContainText('GL-1');

        // "Move all 'Aggressive' to 'Hybrid'" removes the Aggressive group entirely.
        await page.getByRole('button', { name: "Move all 'Aggressive' to 'Hybrid'" }).click();
        await expect(groupRow('Aggressive')).toHaveCount(0);
        await expect(groupRow('Hybrid')).toBeVisible();

        // "Remove all 'Hybrid'" removes the Hybrid group entirely.
        await page.getByRole('button', { name: "Remove all 'Hybrid'" }).click();
        await expect(groupRow('Hybrid')).toHaveCount(0);
    });
});
