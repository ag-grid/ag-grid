import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // groupDefaultExpanded: 1 means level 0 groups are expanded, level 1+ are collapsed
        const groupValues = page.locator('.ag-group-value');

        // Level 0 groups should be visible and expanded
        await expect(groupValues.filter({ hasText: 'Desktop' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'Documents' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'Downloads' }).first()).toBeVisible();

        // Level 1 groups should be visible (as children of expanded level 0) but collapsed
        // ProjectAlpha is level 1 under Desktop - should be visible but collapsed
        await expect(groupValues.filter({ hasText: 'ProjectAlpha' }).first()).toBeVisible();

        // Level 2 leaf nodes under collapsed level 1 groups should NOT be visible
        // Proposal.docx is under Desktop > ProjectAlpha (collapsed level 1)
        await expect(groupValues.filter({ hasText: 'Proposal.docx' })).toHaveCount(0);
    });
});
