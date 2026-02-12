import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // isGroupOpenByDefault opens: Documents (level 0), Work (level 1), ProjectBeta (level 2)
        const groupValues = page.locator('.ag-group-value');

        // Documents > Work > ProjectBeta should be expanded, showing children
        await expect(groupValues.filter({ hasText: 'Documents' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'Work' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'ProjectBeta' }).first()).toBeVisible();

        // ProjectBeta children should be visible
        await expect(groupValues.filter({ hasText: 'Report.pdf' }).first()).toBeVisible();
        await expect(groupValues.filter({ hasText: 'Budget.xlsx' }).first()).toBeVisible();

        // Desktop should be collapsed (not opened by default), children not visible
        await expect(groupValues.filter({ hasText: 'Proposal.docx' })).toHaveCount(0);
    });
});
