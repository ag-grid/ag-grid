import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // The chart is created on first data rendered and the Chart Tool Panels are shown by default,
    // with the Chart (settings) panel active via `defaultToolPanel: 'settings'`.
    test.eachFramework('Chart tool panels open with all three tabs', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tabbedMenu = page.locator('.ag-chart-tabbed-menu');
        await expect(tabbedMenu).toBeVisible();

        // The three tool panel tabs are present.
        await expect(page.locator('.ag-chart-tabbed-menu-header .ag-tab', { hasText: 'Chart' })).toBeVisible();
        await expect(page.locator('.ag-chart-tabbed-menu-header .ag-tab', { hasText: 'Set Up' })).toBeVisible();
        await expect(page.locator('.ag-chart-tabbed-menu-header .ag-tab', { hasText: 'Customize' })).toBeVisible();

        // The Chart (settings) panel is active by default.
        await expect(page.locator('.ag-tab.ag-tab-selected')).toContainText('Chart');
        await expect(page.locator('.ag-chart-settings-wrapper')).toBeVisible();

        // Switching to the Set Up tab shows the data panel.
        await page.locator('.ag-tab', { hasText: 'Set Up' }).click();
        await expect(page.locator('.ag-chart-data-wrapper')).toBeVisible();

        // Switching to the Customize tab shows the format panel.
        await page.locator('.ag-tab', { hasText: 'Customize' }).click();
        await expect(page.locator('.ag-chart-format-wrapper')).toBeVisible();

        // Switching back to the Chart tab shows the mini chart selector again.
        await page.locator('.ag-tab', { hasText: 'Chart' }).click();
        await expect(page.locator('.ag-chart-settings-mini-charts-container')).toBeVisible();
    });

    // AG-18256 - the example page is loaded with the site's resolved colour scheme on its url, and the
    // example runner applies it before the deferred entry module runs. Without that the chart is created
    // against the light theme list while the grid is already dark, which is the mismatch the screenshot
    // on the ticket shows. Asserted here rather than on the docs page because the docs e2e harness loads
    // examples at their own url - the same surface the docs page's iframe navigates to.
    test.describe('chart themes follow the colour scheme the example was loaded with', () => {
        test.describe('dark', () => {
            test.use({ loadPageOptions: { agThemeMode: 'dark-blue' } });

            test.eachFramework('chart themes are dark, matching the grid', async ({ page, remoteGrid }) => {
                await ensureGridReady(page);
                await waitForGridContent(page);
                // The chart is auto-created on first data rendered; the tabbed menu is its tool panel.
                await expect(page.locator('.ag-chart-tabbed-menu')).toBeVisible();

                // Applied synchronously by the runner, so it is already there for the entry module.
                expect(await page.evaluate(() => document.documentElement.dataset.agThemeMode)).toBe('dark-blue');
                expect(await page.evaluate(() => document.documentElement.dataset.colorScheme)).toBe('dark');

                const themes = await remoteGrid(page).getGridOption('chartThemes');

                expect(themes).toBeTruthy();
                expect(themes).not.toHaveLength(0);
                expect(themes!.filter((theme) => !theme.endsWith('-dark'))).toEqual([]);
            });
        });

        test.describe('light', () => {
            test.use({ loadPageOptions: { agThemeMode: 'light' } });

            test.eachFramework('chart themes stay light', async ({ page, remoteGrid }) => {
                await ensureGridReady(page);
                await waitForGridContent(page);
                await expect(page.locator('.ag-chart-tabbed-menu')).toBeVisible();

                expect(await page.evaluate(() => document.documentElement.dataset.agThemeMode)).toBe('light');

                const themes = await remoteGrid(page).getGridOption('chartThemes');

                expect(themes).toBeTruthy();
                expect(themes!.filter((theme) => theme.endsWith('-dark'))).toEqual([]);
            });
        });
    });
});
