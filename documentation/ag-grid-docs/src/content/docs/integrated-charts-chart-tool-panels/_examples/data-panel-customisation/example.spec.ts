import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The Set Up (data) panel is customised: the Categories group is omitted, the Series group is
    // closed by default, and the panel is open by default via `defaultToolPanel: 'data'`.
    test.eachFramework('Set Up panel omits Categories and starts with Series collapsed', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The Set Up (data) panel is active by default.
        await expect(page.locator('.ag-tab.ag-tab-selected')).toContainText('Set Up');
        const dataWrapper = page.locator('.ag-chart-data-wrapper');
        await expect(dataWrapper).toBeVisible();

        // The Categories group is not included.
        await expect(dataWrapper.locator('.ag-charts-data-group-title', { hasText: 'Categories' })).toHaveCount(0);

        // The seriesChartType group only appears in combination charts (this is a grouped column chart).
        await expect(dataWrapper.locator('.ag-charts-data-group-title', { hasText: 'Series Chart Type' })).toHaveCount(
            0
        );

        // The Series group is present but closed by default, so its content (the series pill list) is hidden.
        const seriesGroup = dataWrapper
            .locator('.ag-charts-data-group')
            .filter({ has: page.locator('.ag-charts-data-group-title', { hasText: 'Series' }) });
        await expect(seriesGroup).toHaveCount(1);
        await expect(dataWrapper.locator('.ag-pill-select')).not.toBeVisible();

        // Expanding the Series group reveals the series pill list.
        await seriesGroup.locator('.ag-charts-data-group-title').first().click();
        await expect(dataWrapper.locator('.ag-pill-select').first()).toBeVisible();
    });
});
