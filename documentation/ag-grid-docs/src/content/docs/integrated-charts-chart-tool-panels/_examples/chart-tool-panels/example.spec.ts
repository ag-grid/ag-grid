import type { Page } from '@playwright/test';

import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

/** Midpoint of the 0-255 luminance range, above which a background reads as light. */
const MID_LUMINANCE = 128;

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

    // The example page is loaded with the site's resolved colour scheme on its url, and the runner
    // applies it before the deferred entry module runs - so the chart is built against the matching
    // theme list rather than created light and re-themed. Asserted here rather than on the docs page
    // because the docs e2e harness loads examples at their own url, which is the surface the docs
    // page's iframe navigates to.
    test.describe('the chart is drawn in the colour scheme the example was loaded with', () => {
        // The rendered chart background, not the `chartThemes` option: the option is set by the
        // example's own dark-mode code, so asserting it cannot distinguish a chart that reached the
        // canvas dark from one that never left the light theme. Sampling the canvas can.
        const chartBackgroundLuminance = (page: Page) =>
            page.evaluate(() => {
                const canvas = document.querySelector<HTMLCanvasElement>('.ag-chart-canvas-wrapper canvas');
                const pixels = canvas?.getContext('2d')?.getImageData(2, 2, 6, 6).data;
                if (!pixels) {
                    return undefined;
                }

                let total = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    total += 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
                }

                return total / (pixels.length / 4);
            });

        async function expectChartBackground(page: Page, expected: 'dark' | 'light'): Promise<void> {
            await ensureGridReady(page);
            await waitForGridContent(page);
            // The chart is auto-created on first data rendered; the tabbed menu is its tool panel.
            await expect(page.locator('.ag-chart-tabbed-menu')).toBeVisible();

            await expect(async () => {
                const luminance = await chartBackgroundLuminance(page);

                expect(luminance).toBeDefined();
                if (expected === 'dark') {
                    expect(luminance).toBeLessThan(MID_LUMINANCE);
                } else {
                    expect(luminance).toBeGreaterThan(MID_LUMINANCE);
                }
            }).toPass();
        }

        test.describe('dark', () => {
            test.use({ loadPageOptions: { agThemeMode: 'dark-blue' } });

            test.eachFramework('the chart canvas is dark, matching the grid', async ({ page }) => {
                // Applied synchronously by the runner, so it is already there for the entry module.
                expect(await page.evaluate(() => document.documentElement.dataset.agThemeMode)).toBe('dark-blue');
                expect(await page.evaluate(() => document.documentElement.dataset.colorScheme)).toBe('dark');

                await expectChartBackground(page, 'dark');
            });
        });

        test.describe('light', () => {
            test.use({ loadPageOptions: { agThemeMode: 'light' } });

            test.eachFramework('the chart canvas stays light', async ({ page }) => {
                expect(await page.evaluate(() => document.documentElement.dataset.agThemeMode)).toBe('light');

                await expectChartBackground(page, 'light');
            });
        });
    });
});
