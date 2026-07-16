import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // groupDisplayType: 'groupRows' with no groupDefaultExpanded — every group starts collapsed.
        await ensureGridReady(page);
        await waitForGridContent(page);

        // No child (second-level) group rows are rendered while everything is collapsed
        await expect(page.locator('.ag-row-level-1')).toHaveCount(0);

        // Expand the first (top-level) group row
        const firstExpander = page.locator('.ag-group-contracted:visible').first();
        await firstExpander.click();
        await waitForRowAnimations(page);

        // onRowGroupOpened calls ensureIndexVisible so the group's children are scrolled into view;
        // the expanded group now reveals its second-level child group rows.
        await expect(page.locator('.ag-row-level-1').first()).toBeVisible();
    });
});
