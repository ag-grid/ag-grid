import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page }) => {
        // groupDisplayType: 'groupRows' with no groupDefaultExpanded — every group starts collapsed.
        await ensureGridReady(page);
        await waitForGridContent(page);

        // No child (second-level) group rows are rendered while everything is collapsed
        await expect(page.locator('.ag-row-level-1')).toHaveCount(0);

        // The vertical scroller starts at the top.
        const scroller = page.locator('.ag-grid-viewport.ag-layout-normal').first();
        const scrollTopBefore = await scroller.evaluate((el) => el.scrollTop);
        expect(scrollTopBefore).toBe(0);

        // Expand the LAST group row currently visible near the bottom of the viewport.
        // Because onRowGroupOpened calls ensureIndexVisible(rowIndex + childCount), opening a
        // group this low forces the grid to scroll down so the newly-revealed last child is in view.
        const expander = page.locator('.ag-group-contracted:visible').last();
        await expander.click();
        await waitForRowAnimations(page);

        // The expanded group now reveals its second-level child group rows.
        await expect(page.locator('.ag-row-level-1').first()).toBeVisible();

        // Verify the auto-scroll actually happened: the viewport scrolled down past the top.
        // Without the onRowGroupOpened / ensureIndexVisible behaviour the scroller would stay at 0.
        const scrollTopAfter = await scroller.evaluate((el) => el.scrollTop);
        expect(scrollTopAfter).toBeGreaterThan(0);
    });
});
