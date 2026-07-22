import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // `chartToolPanelsDef.settingsPanel.chartGroupsDef` restricts the Chart (settings) panel to only
    // the Pie, Column and Bar groups, and the panel is open by default via `defaultToolPanel: 'settings'`.
    test.eachFramework('Only the configured chart groups appear in the settings panel', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The Chart (settings) panel is active by default.
        await expect(page.locator('.ag-tab.ag-tab-selected')).toContainText('Chart');
        const settings = page.locator('.ag-chart-settings-wrapper');
        await expect(settings).toBeVisible();

        // Only the Pie, Column and Bar chart groups are shown (see chartGroupsDef).
        await expect(settings.locator('.ag-group-title:visible', { hasText: 'Pie' })).toBeVisible();
        await expect(settings.locator('.ag-group-title:visible', { hasText: 'Column' })).toBeVisible();
        await expect(settings.locator('.ag-group-title:visible', { hasText: 'Bar' })).toBeVisible();

        // Groups that were not included in chartGroupsDef are absent entirely.
        await expect(settings.locator('.ag-group-title', { hasText: 'Line' })).toHaveCount(0);
        await expect(settings.locator('.ag-group-title', { hasText: 'Scatter' })).toHaveCount(0);
        await expect(settings.locator('.ag-group-title', { hasText: 'Area' })).toHaveCount(0);

        // Clicking a mini chart thumbnail selects that chart type (observable via the ag-selected class).
        const firstThumb = page.locator('.ag-chart-settings-mini-wrapper:visible .ag-chart-mini-thumbnail').first();
        await expect(firstThumb).not.toHaveClass(/ag-selected/);
        await firstThumb.click();
        await expect(firstThumb).toHaveClass(/ag-selected/);
    });
});
