import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        await ensureGridReady(page);

        const panel = page.locator('.ag-filter-toolpanel');
        await expect(panel).toBeVisible();

        // The tool panel is shown with the expected filter column groups.
        await expect(agIdFor.filterToolPanelGroup('Athlete')).toBeVisible();
        await expect(agIdFor.filterToolPanelGroup('Competition')).toBeVisible();

        // Year is present in the tool panel.
        await expect(panel.locator('.ag-header-cell-text', { hasText: 'Year' })).toHaveCount(1);

        // suppressExpandAll + suppressFilterSearch hide the whole search / expand-all header.
        await expect(agIdFor.filterToolPanelSearchInput()).toBeHidden();
        await expect(page.locator('.ag-filter-toolpanel-search')).toBeHidden();

        // colDef.suppressFiltersToolPanel = true hides the Date column / filter from the tool panel.
        await expect(panel.locator('.ag-header-cell-text', { hasText: 'Date' })).toHaveCount(0);
    });
});
