import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // onGridReady expands the path to 'Proposal.docx' via API
        const groupValues = page.locator('.ag-group-value');

        // Desktop should be expanded (ancestor of Proposal.docx)
        await expect(groupValues.filter({ hasText: 'Desktop' }).first()).toBeVisible();

        // ProjectAlpha should be expanded (parent of Proposal.docx)
        await expect(groupValues.filter({ hasText: 'ProjectAlpha' }).first()).toBeVisible();

        // Proposal.docx should be visible (target of expansion)
        await expect(groupValues.filter({ hasText: 'Proposal.docx' }).first()).toBeVisible();
    });
});
