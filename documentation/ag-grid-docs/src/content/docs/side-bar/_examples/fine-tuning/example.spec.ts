import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom labels render on the tool panel buttons', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // toolPanels: ['columns', { labelDefault: 'Filters' }, { labelDefault: 'Filters XXXXXXXX' }]
        await expect(page.locator('.ag-side-button')).toHaveCount(3);
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Columns' })).toBeVisible();
        await expect(page.locator('.ag-side-button').filter({ hasText: 'Filters XXXXXXXX' })).toBeVisible();

        // defaultToolPanel: 'filters' => the first (non-XXX) Filters panel is open.
        await expect(page.locator('.ag-side-button.ag-selected')).toContainText('Filters');
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
    });

    test.eachFramework('Clicking the customised Filters button opens its panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const customButton = page.locator('.ag-side-button').filter({ hasText: 'Filters XXXXXXXX' });
        await customButton.click();

        await expect(customButton).toHaveClass(/ag-selected/);
        await expect(page.locator('.ag-tool-panel-wrapper:not(.ag-hidden) .ag-filter-toolpanel')).toBeVisible();
    });
});
