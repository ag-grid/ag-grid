import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        const select = page.locator('#input-display-type');
        const groupWithText = (text: string) => page.locator('.ag-row-group').filter({ hasText: text });
        const leafWithText = (text: string) => page.locator('.ag-row:not(.ag-row-group)').filter({ hasText: text });

        // groupHideParentOfSingleChild = false (default): full country/city hierarchy is shown.
        // France (single city Paris, single athlete Mike) renders its group rows.
        await expect(groupWithText('France').first()).toBeVisible();
        await expect(groupWithText('Paris').first()).toBeVisible();
        // South Africa has two cities, so it is a genuine multi-child group.
        await expect(groupWithText('South Africa').first()).toBeVisible();

        // = true: hide ALL parents of a single child. France -> Paris -> Mike is a single-child
        // chain, so both the France and Paris group rows are removed and the leaf is shown directly.
        await select.selectOption('true');
        await expect(groupWithText('France')).toHaveCount(0);
        await expect(groupWithText('Paris')).toHaveCount(0);
        await expect(leafWithText('Mike').first()).toBeVisible();
        // The multi-child South Africa group is retained.
        await expect(groupWithText('South Africa').first()).toBeVisible();

        // = "leafGroupsOnly": only remove groups whose single child is a leaf. The innermost
        // Paris (single leaf) is removed, but its parent France country group is retained.
        await select.selectOption('leafGroupsOnly');
        await expect(groupWithText('France').first()).toBeVisible();
        await expect(groupWithText('Paris')).toHaveCount(0);
    });
});
