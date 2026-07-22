import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // `chartToolPanelsDef.panels: ['data', 'settings']` omits the Customize panel and puts the Set Up
    // panel before the Chart panel; `defaultToolPanel: 'data'` opens the Set Up panel by default.
    test.eachFramework('Customize panel omitted and Set Up ordered before Chart', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tabs = page.locator('.ag-chart-tabbed-menu-header .ag-tab');

        // Only two tool panels are shown, in the configured order: Set Up then Chart.
        await expect(tabs).toHaveCount(2);
        await expect(tabs.nth(0)).toContainText('Set Up');
        await expect(tabs.nth(1)).toContainText('Chart');

        // The Customize panel has been omitted.
        await expect(page.locator('.ag-chart-tabbed-menu-header .ag-tab', { hasText: 'Customize' })).toHaveCount(0);

        // The Set Up panel is open by default.
        await expect(page.locator('.ag-tab.ag-tab-selected')).toContainText('Set Up');
        await expect(page.locator('.ag-chart-data-wrapper')).toBeVisible();

        // Switching to the Chart tab still works.
        await tabs.nth(1).click();
        await expect(page.locator('.ag-chart-settings-wrapper')).toBeVisible();
    });
});
