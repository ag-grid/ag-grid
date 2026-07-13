import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Rows added by transaction inherit the parent group selection', async ({ page }) => {
        await waitForGridContent(page);

        const aggressiveGroup = page
            .locator('.ag-row')
            .filter({ has: page.locator('.ag-group-value', { hasText: 'Aggressive' }) })
            .first();
        await expect(aggressiveGroup).toBeVisible();

        // The Aggressive group is open by default with children tradeId 0 and 1.
        await expect(page.locator('.ag-row[row-id="0"]')).toBeVisible();
        await expect(page.locator('.ag-row[row-id="1"]')).toBeVisible();

        // Select the Aggressive group — with groupSelects: 'descendants' this selects the
        // group and all of its existing children.
        await aggressiveGroup.locator('.ag-checkbox-input').first().click();
        await expect(page.locator('.ag-row[row-id="Aggressive"]')).toHaveClass(/ag-row-selected/);
        await expect(page.locator('.ag-row[row-id="0"]')).toHaveClass(/ag-row-selected/);
        await expect(page.locator('.ag-row[row-id="1"]')).toHaveClass(/ag-row-selected/);

        // Add a new child to the selected group via a server-side transaction. The new row
        // (tradeId 11) inherits the parent group's selection.
        await page.getByRole('button', { name: "Add new 'Aggressive'" }).click();

        const newRow = page.locator('.ag-row[row-id="11"]');
        await expect(newRow).toBeVisible();
        await expect(newRow.locator('[col-id="book"]')).toContainText('GL-1');
        await expect(newRow).toHaveClass(/ag-row-selected/);
    });
});
