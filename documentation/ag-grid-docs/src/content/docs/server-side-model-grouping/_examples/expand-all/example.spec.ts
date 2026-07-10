import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Expand All / Collapse All expand and hide loaded groups', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Top level is grouped by Year; nested groups (Country) are collapsed initially.
        await expect(groupRow('2000')).toBeVisible();
        await expect(groupRow('United States')).toBeHidden();

        // Expand All expands the loaded groups, revealing the nested Country groups.
        await page.getByRole('button', { name: 'Expand All' }).click();
        await expect(groupRow('United States')).toBeVisible();

        // Collapse All hides the nested groups again.
        await page.getByRole('button', { name: 'Collapse All' }).click();
        await expect(groupRow('United States')).toBeHidden();
        await expect(groupRow('2000')).toBeVisible();
    });
});
