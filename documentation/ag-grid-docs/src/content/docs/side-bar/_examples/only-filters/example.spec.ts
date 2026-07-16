import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('String config shows only the Filters panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // sideBar: 'filters' => only the Filters tool panel button is shown.
        const sideButtons = page.locator('.ag-side-button');
        await expect(sideButtons).toHaveCount(1);
        await expect(sideButtons.filter({ hasText: 'Filters' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toHaveCount(0);

        // Filters is the only panel and is open.
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
    });
});
